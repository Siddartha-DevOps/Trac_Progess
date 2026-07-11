import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let mockService: any;

  const mockUser = {
    id: 'user-uuid-112233',
    email: 'test@buildtrace.in',
    firstName: 'Arjun',
    lastName: 'Sharma',
    phoneNumber: '+919876543210',
    isActive: true,
    role: 'SiteEngineer',
    isEmailVerified: true,
    isPhoneVerified: false,
    preferences: { theme: 'light' },
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    organizationId: 'org-uuid-999',
    invitationAccepted: true,
  };

  beforeEach(async () => {
    mockService = {
      create: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
      findAll: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
      invite: jest.fn(),
      acceptInvitation: jest.fn(),
      requestPasswordReset: jest.fn(),
      resetPassword: jest.fn(),
      verifyEmail: jest.fn(),
      requestPhoneVerification: jest.fn(),
      verifyPhone: jest.fn(),
      updatePreferences: jest.fn(),
      deactivate: jest.fn(),
      activate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

    it('should delegate creation pipeline to service', async () => {
      mockService.create.mockResolvedValue(mockUser);
      const req = { user: { id: 'usr-admin-123' } };

      const result = await controller.create(createDto, req);

      expect(result).toEqual(mockUser);
      expect(mockService.create).toHaveBeenCalledWith(createDto, 'usr-admin-123');
    });
  });

  describe('getProfile', () => {
    it('should retrieve profile configuration matching session context', async () => {
      mockService.findOne.mockResolvedValue(mockUser);
      const req = { user: { id: 'user-uuid-112233' } };

      const result = await controller.getProfile(req);

      expect(result).toEqual(mockUser);
      expect(mockService.findOne).toHaveBeenCalledWith('user-uuid-112233');
    });
  });

  describe('findAll', () => {
    const queryDto: QueryUserDto = { page: 1, limit: 10, search: 'Arjun' };

    it('should delegate filtered queries to service', async () => {
      const paginatedResponse = { items: [mockUser], meta: { totalItems: 1 } };
      mockService.findAll.mockResolvedValue(paginatedResponse);

      const result = await controller.findAll(queryDto);

      expect(result).toEqual(paginatedResponse);
      expect(mockService.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('update', () => {
    const updateDto: UpdateUserDto = { firstName: 'Arjun-Updated' };

    it('should delegate update commands to service', async () => {
      const updatedUser = { ...mockUser, firstName: 'Arjun-Updated' };
      mockService.update.mockResolvedValue(updatedUser);
      const req = { user: { id: 'user-uuid-112233', role: 'SiteEngineer' } };

      const result = await controller.update('user-uuid-112233', updateDto, req);

      expect(result).toEqual(updatedUser);
      expect(mockService.update).toHaveBeenCalledWith('user-uuid-112233', updateDto, 'user-uuid-112233');
    });
  });

  describe('invite', () => {
    it('should delegate team invitation triggers to service', async () => {
      mockService.invite.mockResolvedValue(mockUser);
      const req = { user: { id: 'usr-admin-123' } };
      const invitePayload = {
        email: 'new@buildtrace.in',
        firstName: 'Rohan',
        lastName: 'Verma',
        role: 'SiteEngineer',
        organizationId: 'org-uuid-999',
      };

      const result = await controller.invite(invitePayload, req);

      expect(result).toEqual(mockUser);
      expect(mockService.invite).toHaveBeenCalledWith(invitePayload, 'usr-admin-123');
    });
  });

  describe('deactivate', () => {
    it('should delegate deactivation commands to service', async () => {
      mockService.deactivate.mockResolvedValue({ ...mockUser, isActive: false });
      const req = { user: { id: 'usr-admin-123' } };

      const result = await controller.deactivate('user-uuid-112233', req);

      expect(result.isActive).toBeFalsy();
      expect(mockService.deactivate).toHaveBeenCalledWith('user-uuid-112233', 'usr-admin-123');
    });
  });
});
