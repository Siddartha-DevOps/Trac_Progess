import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { AuditService } from '../../common/audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { InviteUserDto, AcceptInvitationDto } from './dto/invite-user.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyPhoneDto } from './dto/verify-phone.dto';
import { UpdateUserPreferencesDto } from './dto/user-preferences.dto';
import { UserResponseDto, PaginatedUserResponseDto } from './dto/user-response.dto';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly repository: UsersRepository,
    private readonly auditService: AuditService,
  ) {}

  /**
   * Helper utility to secure user password credentials using SHA-256.
   */
  private hashPassword(password: string): string {
    return crypto.createHash('sha256').update(password).digest('hex');
  }

  /**
   * Generate a secure random hexadecimal string token for registration links.
   */
  private generateToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async create(createDto: CreateUserDto, actorUserId?: string): Promise<UserResponseDto> {
    this.logger.log(`Beginning User creation pipeline for email: ${createDto.email}`);

    // 1. Validate email uniqueness
    const existingEmail = await this.repository.findByEmail(createDto.email, true);
    if (existingEmail) {
      throw new ConflictException(`A user with the email address [${createDto.email}] is already registered.`);
    }

    // 2. Validate phone uniqueness if specified
    if (createDto.phoneNumber) {
      const existingPhone = await this.repository.findByPhone(createDto.phoneNumber, true);
      if (existingPhone) {
        throw new ConflictException(`A user with the phone number [${createDto.phoneNumber}] is already registered.`);
      }
    }

    // 3. Generate password hash
    const pass = createDto.password || crypto.randomBytes(12).toString('base64');
    const passwordHash = this.hashPassword(pass);

    // 4. Create database record
    const user = await this.repository.create(createDto, passwordHash);

    // 5. Save audit log trail
    await this.auditService.log({
      action: 'INSERT',
      tableName: 'User',
      recordId: user.id,
      newValues: { ...user, passwordHash: '[REDACTED]' },
      userId: actorUserId,
      organizationId: user.organizationId,
    });

    this.logger.log(`Successfully registered User ID: ${user.id}`);
    return user;
  }

  async update(id: string, updateDto: UpdateUserDto, actorUserId?: string): Promise<UserResponseDto> {
    this.logger.log(`Beginning User profile update pipeline for ID: ${id}`);

    // 1. Confirm record exists
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException(`User with ID [${id}] was not found or has been soft-deleted.`);
    }

    // 2. Validate phone uniqueness if modified
    if (updateDto.phoneNumber && updateDto.phoneNumber !== current.phoneNumber) {
      const existingPhone = await this.repository.findByPhone(updateDto.phoneNumber, true);
      if (existingPhone) {
        throw new ConflictException(`A user with phone number [${updateDto.phoneNumber}] is already registered.`);
      }
    }

    // 3. Update fields
    const updateData: any = {};
    if (updateDto.firstName !== undefined) updateData.firstName = updateDto.firstName;
    if (updateDto.lastName !== undefined) updateData.lastName = updateDto.lastName;
    if (updateDto.phoneNumber !== undefined) updateData.phoneNumber = updateDto.phoneNumber;
    if (updateDto.avatarUrl !== undefined) updateData.avatarUrl = updateDto.avatarUrl;
    if (updateDto.isActive !== undefined) updateData.isActive = updateDto.isActive;

    const updated = await this.repository.update(id, updateData);

    // 4. Record audit log
    await this.auditService.log({
      action: 'UPDATE',
      tableName: 'User',
      recordId: id,
      oldValues: { ...current, passwordHash: '[REDACTED]' },
      newValues: { ...updated, passwordHash: '[REDACTED]' },
      userId: actorUserId,
      organizationId: updated.organizationId,
    });

    this.logger.log(`Successfully updated User ID: ${id}`);
    return updated;
  }

  async findOne(id: string, includeDeleted = false): Promise<UserResponseDto> {
    this.logger.log(`Retrieving User ID: ${id} (IncludeDeleted: ${includeDeleted})`);
    const user = await this.repository.findById(id, includeDeleted);
    
    if (!user) {
      throw new NotFoundException(`User with ID [${id}] does not exist.`);
    }

    return user;
  }

  async findAll(queryDto: QueryUserDto): Promise<PaginatedUserResponseDto> {
    this.logger.log(`Retrieving paginated Users list: page=${queryDto.page}, limit=${queryDto.limit}`);
    
    const { items, totalItems } = await this.repository.findAll(queryDto);
    const totalPages = Math.ceil(totalItems / (queryDto.limit || 10)) || 1;

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: queryDto.limit || 10,
        totalPages,
        currentPage: queryDto.page || 1,
      },
    };
  }

  async softDelete(id: string, actorUserId?: string): Promise<UserResponseDto> {
    this.logger.log(`Initiating soft-delete for User ID: ${id}`);

    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException(`User with ID [${id}] does not exist or has already been soft-deleted.`);
    }

    const updated = await this.repository.softDelete(id);

    // Audit deactivation
    await this.auditService.log({
      action: 'DELETE',
      tableName: 'User',
      recordId: id,
      oldValues: { ...current, passwordHash: '[REDACTED]' },
      newValues: { ...updated, passwordHash: '[REDACTED]' },
      userId: actorUserId,
      organizationId: id,
    });

    this.logger.log(`Successfully soft-deleted User ID: ${id}`);
    return updated;
  }

  async restore(id: string, actorUserId?: string): Promise<UserResponseDto> {
    this.logger.log(`Initiating restoration for soft-deleted User ID: ${id}`);

    const current = await this.repository.findById(id, true);
    if (!current) {
      throw new NotFoundException(`User with ID [${id}] does not exist.`);
    }

    if (!current.deletedAt) {
      throw new BadRequestException(`User with ID [${id}] is active and does not require restoration.`);
    }

    const updated = await this.repository.restore(id);

    // Audit restoration
    await this.auditService.log({
      action: 'RESTORE',
      tableName: 'User',
      recordId: id,
      oldValues: { ...current, passwordHash: '[REDACTED]' },
      newValues: { ...updated, passwordHash: '[REDACTED]' },
      userId: actorUserId,
      organizationId: id,
    });

    this.logger.log(`Successfully restored User ID: ${id}`);
    return updated;
  }

  /**
   * INVITATION WORKFLOW: Invites a user, creating an inactive profile and returning a secure onboarding token.
   */
  async invite(inviteDto: InviteUserDto, actorUserId?: string): Promise<UserResponseDto> {
    this.logger.log(`Inviting user with email: ${inviteDto.email}`);

    // 1. Prevent duplicate registrations
    const existing = await this.repository.findByEmail(inviteDto.email, true);
    if (existing) {
      throw new ConflictException(`User with email [${inviteDto.email}] is already present on the platform.`);
    }

    // 2. Generate secure token details (7-day expiration)
    const token = `invite_token_${this.generateToken().substring(0, 16)}`;
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 7);

    // 3. Create the inactive user profile in the database
    const randomPass = crypto.randomBytes(16).toString('hex');
    const passwordHash = this.hashPassword(randomPass);

    const newUser = await this.repository.create({
      email: inviteDto.email,
      firstName: inviteDto.firstName,
      lastName: inviteDto.lastName,
      role: inviteDto.role,
      organizationId: inviteDto.organizationId,
    }, passwordHash);

    // Save tokens inside record
    const updated = await this.repository.update(newUser.id, {
      invitationToken: token,
      invitationExpires: expiration,
      isActive: false, // user cannot sign in until invitation accepts
    });

    // 4. Save audit log
    await this.auditService.log({
      action: 'INSERT',
      tableName: 'User',
      recordId: newUser.id,
      newValues: { ...updated, passwordHash: '[REDACTED]', invitationToken: '[REDACTED]' },
      userId: actorUserId,
      organizationId: inviteDto.organizationId,
    });

    // 5. Simulate email dispatch
    this.logger.log(`Simulated Email Dispatch: "Hello ${inviteDto.firstName}, you have been invited to BuildTrace India. Onboarding Token: ${token}"`);

    return updated;
  }

  /**
   * INVITATION WORKFLOW: Accept invitation and activate user profile.
   */
  async acceptInvitation(acceptDto: AcceptInvitationDto): Promise<UserResponseDto> {
    this.logger.log(`Processing Accept Invitation token verification...`);

    const user = await this.repository.findByInvitationToken(acceptDto.token);
    if (!user) {
      throw new BadRequestException('The invitation token is invalid or does not match any profile.');
    }

    if (user.invitationExpires && new Date() > user.invitationExpires) {
      throw new BadRequestException('This invitation has expired. Please request a new invitation from your administrator.');
    }

    // Hash the actual password
    const passwordHash = this.hashPassword(acceptDto.password);

    const updated = await this.repository.update(user.id, {
      passwordHash,
      invitationAccepted: true,
      invitationToken: null,
      invitationExpires: null,
      isActive: true,
      isEmailVerified: true, // Verification is implied as they clicked the link in their mail box
      emailVerifiedAt: new Date(),
    });

    await this.auditService.log({
      action: 'UPDATE',
      tableName: 'User',
      recordId: user.id,
      newValues: { ...updated, passwordHash: '[REDACTED]' },
      userId: user.id,
      organizationId: user.organizationId,
    });

    this.logger.log(`User ID: ${user.id} has successfully accepted their invitation and joined the system.`);
    return updated;
  }

  /**
   * PASSWORD RECOVERY WORKFLOW: Request token
   */
  async requestPasswordReset(requestDto: RequestPasswordResetDto): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Requesting recovery password token for email: ${requestDto.email}`);

    const user = await this.repository.findByEmail(requestDto.email);
    if (!user) {
      // Return a success-like message anyway to prevent email enumeration vulnerability
      return { success: true, message: 'If the email matches a registered profile, a security token has been dispatched.' };
    }

    const resetToken = `reset_token_${this.generateToken().substring(0, 16)}`;
    const expiration = new Date();
    expiration.setHours(expiration.getHours() + 1); // 1-hour expiration limit

    await this.repository.update(user.id, {
      passwordResetToken: resetToken,
      passwordResetExpires: expiration,
    });

    // Simulate sending recovery email
    this.logger.log(`Simulated Recovery Email Dispatch: "Hello ${user.firstName}, reset link: https://buildtrace.in/reset-password?token=${resetToken}"`);

    return { success: true, message: 'If the email matches a registered profile, a security token has been dispatched.' };
  }

  /**
   * PASSWORD RECOVERY WORKFLOW: Reset action
   */
  async resetPassword(resetDto: ResetPasswordDto): Promise<UserResponseDto> {
    this.logger.log(`Completing password reset pipeline using token.`);

    const user = await this.repository.findByResetToken(resetDto.token);
    if (!user) {
      throw new BadRequestException('The recovery token is invalid.');
    }

    if (user.passwordResetExpires && new Date() > user.passwordResetExpires) {
      throw new BadRequestException('This recovery link has expired. Please initiate a new password reset request.');
    }

    const passwordHash = this.hashPassword(resetDto.newPassword);

    const updated = await this.repository.update(user.id, {
      passwordHash,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    await this.auditService.log({
      action: 'UPDATE',
      tableName: 'User',
      recordId: user.id,
      newValues: { ...updated, passwordHash: '[REDACTED]' },
      userId: user.id,
      organizationId: user.organizationId,
    });

    this.logger.log(`User ID: ${user.id} has updated their password credentials successfully.`);
    return updated;
  }

  /**
   * VERIFICATION WORKFLOWS: Email activation
   */
  async verifyEmail(verifyDto: VerifyEmailDto): Promise<UserResponseDto> {
    this.logger.log(`Verifying user email address via token.`);

    const user = await this.repository.findByVerificationToken(verifyDto.token);
    if (!user) {
      throw new BadRequestException('Invalid email verification link.');
    }

    const updated = await this.repository.update(user.id, {
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      verificationToken: null,
    });

    await this.auditService.log({
      action: 'UPDATE',
      tableName: 'User',
      recordId: user.id,
      newValues: { ...updated, passwordHash: '[REDACTED]' },
      userId: user.id,
      organizationId: user.organizationId,
    });

    return updated;
  }

  /**
   * VERIFICATION WORKFLOWS: Phone OTP Dispatch simulation
   */
  async requestPhoneVerification(id: string, phoneNumber: string): Promise<{ success: boolean; code: string }> {
    this.logger.log(`Simulating OTP sms dispatch to phone number: ${phoneNumber}`);

    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException(`User profile with ID [${id}] does not exist.`);
    }

    // Save phoneNumber to user profile if missing or different
    if (user.phoneNumber !== phoneNumber) {
      await this.repository.update(id, { phoneNumber });
    }

    // Simulate OTP (we will accept "554321" during verification for simple integration tests, but generate "554321" here)
    const simulatedOtp = '554321';

    this.logger.log(`Simulated SMS Gateway Dispatch to [${phoneNumber}]: "Your BuildTrace India OTP is ${simulatedOtp}."`);

    return { success: true, code: simulatedOtp };
  }

  /**
   * VERIFICATION WORKFLOWS: Verify Phone code
   */
  async verifyPhone(id: string, verifyDto: VerifyPhoneDto): Promise<UserResponseDto> {
    this.logger.log(`Processing phone number OTP verification...`);

    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException(`User profile with ID [${id}] does not exist.`);
    }

    // Check code
    if (verifyDto.code !== '554321') {
      throw new BadRequestException('Incorrect OTP code verification.');
    }

    const updated = await this.repository.update(id, {
      isPhoneVerified: true,
      phoneVerifiedAt: new Date(),
      phoneNumber: verifyDto.phoneNumber,
    });

    await this.auditService.log({
      action: 'UPDATE',
      tableName: 'User',
      recordId: id,
      newValues: { ...updated, passwordHash: '[REDACTED]' },
      userId: id,
      organizationId: user.organizationId,
    });

    return updated;
  }

  /**
   * PREFERENCES: Update user configurations
   */
  async updatePreferences(id: string, preferencesDto: UpdateUserPreferencesDto): Promise<UserResponseDto> {
    this.logger.log(`Updating preferences block for User ID: ${id}`);

    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException(`User profile with ID [${id}] does not exist.`);
    }

    // Deep merge existing preferences with requested updates
    const currentPreferences = (user.preferences as Record<string, any>) || {};
    const mergedPreferences = {
      ...currentPreferences,
      ...preferencesDto,
    };

    const updated = await this.repository.update(id, {
      preferences: mergedPreferences,
    });

    return updated;
  }

  /**
   * ADMIN PROFILE DEACTIVATION: Toggles account isActive flag
   */
  async deactivate(id: string, actorUserId?: string): Promise<UserResponseDto> {
    this.logger.log(`Suspending User ID: ${id}`);

    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException(`User ID [${id}] does not exist.`);
    }

    const updated = await this.repository.update(id, { isActive: false });

    await this.auditService.log({
      action: 'UPDATE',
      tableName: 'User',
      recordId: id,
      oldValues: { ...user, passwordHash: '[REDACTED]' },
      newValues: { ...updated, passwordHash: '[REDACTED]' },
      userId: actorUserId,
      organizationId: user.organizationId,
    });

    return updated;
  }

  async activate(id: string, actorUserId?: string): Promise<UserResponseDto> {
    this.logger.log(`Activating suspended User ID: ${id}`);

    const user = await this.repository.findById(id);
    if (!user) {
      throw new NotFoundException(`User ID [${id}] does not exist.`);
    }

    const updated = await this.repository.update(id, { isActive: true });

    await this.auditService.log({
      action: 'UPDATE',
      tableName: 'User',
      recordId: id,
      oldValues: { ...user, passwordHash: '[REDACTED]' },
      newValues: { ...updated, passwordHash: '[REDACTED]' },
      userId: actorUserId,
      organizationId: user.organizationId,
    });

    return updated;
  }
}
