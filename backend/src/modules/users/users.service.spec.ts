import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { AuditService } from '../../common/audit/audit.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersService', () => {
  let service: UsersService;
  let mockRepository: any;
  let mockAuditService: any;

  const mockUser = {
    id: 'user-uuid-112233',
    email: 'test@buildtrace.in',
    passwordHash: 'hashed-password-1234',
    firstName: 'Arjun',
    lastName: 'Sharma',
    phoneNumber: '+919876543210',
    isActive: true,
    role: 'SiteEngineer',
    isEmailVerified: false,
    isPhoneVerified: false,
    preferences: { theme: 'light' },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    organizationId: 'org-uuid-999',
    invitationAccepted: false,
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByPhone: jest.fn(),
      findByVerificationToken: jest.fn(),
      findByResetToken: jest.fn(),
      findByInvitationToken: jest.fn(),
      findAll: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
    };

    mockAuditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockRepository },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateUserDto = {
      email: 'test@buildtrace.in',
      firstName: 'Arjun',
      lastName: 'Sharma',
      password: 'SecurePassword123!',
      organizationId: 'org-uuid-999',
      role: 'SiteEngineer',
      phoneNumber: '+919876543210',
    };

    it('should register a new active user profile and write audit logs', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.findByPhone.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockUser);

      const result = await service.create(createDto, 'actor-admin-123');

      expect(result).toEqual(mockUser);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('test@buildtrace.in', true);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'INSERT',
          tableName: 'User',
          recordId: mockUser.id,
        }),
      );
    });

    it('should reject requests with existing email conflicts', async () => {
      mockRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.create(createDto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = { firstName: 'Arjun-Updated' };

    it('should successfully update user profile metadata', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      const updatedUser = { ...mockUser, firstName: 'Arjun-Updated' };
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await service.update('user-uuid-112233', updateDto, 'actor-admin-123');

      expect(result.firstName).toEqual('Arjun-Updated');
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          tableName: 'User',
          recordId: 'user-uuid-112233',
        }),
      );
    });

    it('should raise NotFoundException for invalid user GUID inputs', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update('invalid-uuid', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('invite', () => {
    it('should create an inactive profile with invitation expiry token', async () => {
      mockRepository.findByEmail.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockUser);
      const invitedUser = { ...mockUser, invitationToken: 'invite_token_123', isActive: false };
      mockRepository.update.mockResolvedValue(invitedUser);

      const result = await service.invite({
        email: 'invited@buildtrace.in',
        firstName: 'Rohan',
        lastName: 'Verma',
        role: 'SiteEngineer',
        organizationId: 'org-uuid-999',
      }, 'actor-admin-123');

      expect(result.isActive).toBeFalsy();
      expect(result.invitationToken).toBeDefined();
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'INSERT',
          tableName: 'User',
        }),
      );
    });
  });

  describe('acceptInvitation', () => {
    it('should accept credentials and activate the user session', async () => {
      const pendingUser = {
        ...mockUser,
        invitationToken: 'invite_token_123',
        invitationExpires: new Date(Date.now() + 10000),
        invitationAccepted: false,
        isActive: false,
      };
      mockRepository.findByInvitationToken.mockResolvedValue(pendingUser);
      const activeUser = { ...mockUser, invitationAccepted: true, isActive: true, isEmailVerified: true };
      mockRepository.update.mockResolvedValue(activeUser);

      const result = await service.acceptInvitation({
        token: 'invite_token_123',
        password: 'MyBrandNewPassword2026',
      });

      expect(result.isActive).toBeTruthy();
      expect(result.invitationAccepted).toBeTruthy();
      expect(result.isEmailVerified).toBeTruthy();
    });
  });

  describe('verifyPhone', () => {
    it('should approve verification states given valid OTP inputs', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      const verifiedUser = { ...mockUser, isPhoneVerified: true };
      mockRepository.update.mockResolvedValue(verifiedUser);

      const result = await service.verifyPhone('user-uuid-112233', {
        phoneNumber: '+919876543210',
        code: '554321',
      });

      expect(result.isPhoneVerified).toBeTruthy();
    });

    it('should raise BadRequestException for incorrect OTP codes', async () => {
      mockRepository.findById.mockResolvedValue(mockUser);

      await expect(service.verifyPhone('user-uuid-112233', {
        phoneNumber: '+919876543210',
        code: '000000',
      })).rejects.toThrow(BadRequestException);
    });
  });
});
