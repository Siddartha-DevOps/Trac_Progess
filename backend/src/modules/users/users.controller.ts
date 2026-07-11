import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { InviteUserDto, AcceptInvitationDto } from './dto/invite-user.dto';
import { RequestPasswordResetDto, ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { RequestPhoneVerificationDto, VerifyPhoneDto } from './dto/verify-phone.dto';
import { UpdateUserPreferencesDto } from './dto/user-preferences.dto';
import { UserResponseDto, PaginatedUserResponseDto } from './dto/user-response.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register a new active user profile directly',
    description: 'Creates a fully active user in an organization. Limited to system administrators.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The user profile has been successfully registered.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email address or phone number already in use.' })
  create(@Body() createDto: CreateUserDto, @Req() req: any) {
    const actorUserId = req.user?.id;
    return this.usersService.create(createDto, actorUserId);
  }

  @Post('invite')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Invite a team member by email',
    description: 'Pre-registers an inactive profile and generates a secure onboarding URL token valid for 7 days.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invitation generated and simulated notification sent.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'User already exists.' })
  invite(@Body() inviteDto: InviteUserDto, @Req() req: any) {
    const actorUserId = req.user?.id;
    return this.usersService.invite(inviteDto, actorUserId);
  }

  @Post('accept-invitation')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Accept team invitation onboarding',
    description: 'Unlocks and activates an invited profile, setting their password and clearing invitation tokens.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Onboarding completed and profile activated.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid or expired invitation token.' })
  acceptInvitation(@Body() acceptDto: AcceptInvitationDto) {
    return this.usersService.acceptInvitation(acceptDto);
  }

  @Post('request-password-reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request recovery password token',
    description: 'Simulates dispatching a 1-hour secure password reset link to user email inbox.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Token request processed.' })
  requestPasswordReset(@Body() requestDto: RequestPasswordResetDto) {
    return this.usersService.requestPasswordReset(requestDto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm password recovery update',
    description: 'Consumes password recovery token and saves the new secure credentials.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Password reset successfully.',
    type: UserResponseDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Expired or mismatched recovery token.' })
  resetPassword(@Body() resetDto: ResetPasswordDto) {
    return this.usersService.resetPassword(resetDto);
  }

  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm profile email verification',
    description: 'Enforces email verification using token received on account registration.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Email verified.',
    type: UserResponseDto,
  })
  verifyEmail(@Body() verifyDto: VerifyEmailDto) {
    return this.usersService.verifyEmail(verifyDto);
  }

  @Post('verify-phone/request')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Request mobile phone OTP SMS code',
    description: 'Fires a simulated SMS gateway dispatch containing a 6-digit verification code.',
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'SMS OTP dispatch successfully simulated.' })
  requestPhoneVerification(@Body() dto: RequestPhoneVerificationDto, @Req() req: any) {
    return this.usersService.requestPhoneVerification(req.user.id, dto.phoneNumber);
  }

  @Post('verify-phone')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Confirm mobile phone number OTP code',
    description: 'Validates 6-digit numeric OTP code. Use standard sandbox value "554321".',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Mobile phone successfully validated.',
    type: UserResponseDto,
  })
  verifyPhone(@Body() verifyDto: VerifyPhoneDto, @Req() req: any) {
    return this.usersService.verifyPhone(req.user.id, verifyDto);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Fetch current active profile configuration',
    description: 'Retrieves authentication parameters and contextual settings for the logged-in user session.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Active session profile details.',
    type: UserResponseDto,
  })
  getProfile(@Req() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin', 'SiteEngineer', 'Auditor')
  @ApiOperation({
    summary: 'Retrieve all users with paginated filters and keyword searches',
    description: 'Search site operators, managers, or auditors. Supports filters matching organizational parent structures.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fetched paginated records.',
    type: PaginatedUserResponseDto,
  })
  findAll(@Query() queryDto: QueryUserDto) {
    return this.usersService.findAll(queryDto);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin', 'SiteEngineer', 'Auditor')
  @ApiOperation({
    summary: 'Retrieve detailed user profiles by GUID',
  })
  @ApiParam({ name: 'id', description: 'The unique user UUID v4' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Record matching ID found.',
    type: UserResponseDto,
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin', 'SiteEngineer')
  @ApiOperation({
    summary: 'Modify user profile parameters',
    description: 'Updates personal fields like names and avatars. Restricted to Administrators or the profile owner themselves.',
  })
  @ApiParam({ name: 'id', description: 'The target user UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User details updated.',
    type: UserResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateUserDto,
    @Req() req: any,
  ) {
    // Only Administrators or the exact profile holder can edit this record
    if (req.user.role !== 'Admin' && req.user.id !== id) {
      throw new ForbiddenException('You lack authorization to modify another operator’s profile.');
    }
    const actorUserId = req.user?.id;
    return this.usersService.update(id, updateDto, actorUserId);
  }

  @Patch(':id/preferences')
  @UseGuards(AuthGuard)
  @ApiOperation({
    summary: 'Update personalized layout settings and communication frequencies',
  })
  @ApiParam({ name: 'id', description: 'The user UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Preferences saved.',
    type: UserResponseDto,
  })
  updatePreferences(
    @Param('id') id: string,
    @Body() preferencesDto: UpdateUserPreferencesDto,
    @Req() req: any,
  ) {
    if (req.user.role !== 'Admin' && req.user.id !== id) {
      throw new ForbiddenException('You cannot edit settings on behalf of other operators.');
    }
    return this.usersService.updatePreferences(id, preferencesDto);
  }

  @Post(':id/avatar')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Simulate file-upload of a user avatar photo',
    description: 'Registers custom profile picture URLs in database structures.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avatar URL updated.',
    type: UserResponseDto,
  })
  updateAvatar(@Param('id') id: string, @Body('avatarUrl') avatarUrl: string, @Req() req: any) {
    if (req.user.role !== 'Admin' && req.user.id !== id) {
      throw new ForbiddenException('Authorization missing to change avatar file links.');
    }
    return this.usersService.update(id, { avatarUrl }, req.user.id);
  }

  @Post(':id/deactivate')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Suspend active operator account',
    description: 'Blocks user logins immediately without removing historical contributions or logs.',
  })
  @ApiParam({ name: 'id', description: 'The target user UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account suspended.',
    type: UserResponseDto,
  })
  deactivate(@Param('id') id: string, @Req() req: any) {
    return this.usersService.deactivate(id, req.user?.id);
  }

  @Post(':id/activate')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Re-activate suspended operator account',
  })
  @ApiParam({ name: 'id', description: 'The suspended user UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Account restored and active.',
    type: UserResponseDto,
  })
  activate(@Param('id') id: string, @Req() req: any) {
    return this.usersService.activate(id, req.user?.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  @ApiOperation({
    summary: 'Soft-delete user account',
    description: 'Flags the record with a deletedAt timestamp, completely excluding them from basic API lists.',
  })
  @ApiParam({ name: 'id', description: 'The target user GUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Record soft-deleted.',
    type: UserResponseDto,
  })
  softDelete(@Param('id') id: string, @Req() req: any) {
    const actorUserId = req.user?.id;
    return this.usersService.softDelete(id, actorUserId);
  }

  @Post(':id/restore')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles('Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore a soft-deleted user account',
  })
  @ApiParam({ name: 'id', description: 'The user UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The user has been successfully restored.',
    type: UserResponseDto,
  })
  restore(@Param('id') id: string, @Req() req: any) {
    const actorUserId = req.user?.id;
    return this.usersService.restore(id, actorUserId);
  }
}
