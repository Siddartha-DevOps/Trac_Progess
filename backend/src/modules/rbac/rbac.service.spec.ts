import { Test, TestingModule } from '@nestjs/testing';
import { RbacService } from './rbac.service';
import { RbacRepository } from './rbac.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

describe('RbacService (Unit)', () => {
  let service: RbacService;
  let repository: any;
  let prisma: any;

  const mockRole = {
    id: 'role-uuid-1',
    name: 'SiteEngineer',
    description: 'Field engineer',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    permissions: [],
  };

  const mockPermission = {
    id: 'perm-uuid-1',
    name: 'anomalies:create',
    description: 'Create anomalies',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepo = {
      createRole: jest.fn().mockResolvedValue(mockRole),
      updateRole: jest.fn().mockImplementation((id, dto) => Promise.resolve({ ...mockRole, ...dto })),
      findRoleById: jest.fn().mockResolvedValue(mockRole),
      findRoleByName: jest.fn().mockResolvedValue(null),
      findAllRoles: jest.fn().mockResolvedValue({ items: [mockRole], totalItems: 1 }),
      softDeleteRole: jest.fn().mockResolvedValue({ ...mockRole, deletedAt: new Date() }),
      restoreRole: jest.fn().mockResolvedValue(mockRole),
      createPermission: jest.fn().mockResolvedValue(mockPermission),
      updatePermission: jest.fn().mockImplementation((id, dto) => Promise.resolve({ ...mockPermission, ...dto })),
      findPermissionById: jest.fn().mockResolvedValue(mockPermission),
      findPermissionByName: jest.fn().mockResolvedValue(null),
      findAllPermissions: jest.fn().mockResolvedValue({ items: [mockPermission], totalItems: 1 }),
      deletePermission: jest.fn().mockResolvedValue({ success: true }),
      assignPermissionsToRole: jest.fn().mockResolvedValue({ ...mockRole, permissions: [mockPermission] }),
      assignRoleToUser: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockPrisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'user-uuid-1', email: 'arjun@buildtrace.in', firstName: 'Arjun', lastName: 'Sharma' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RbacService,
        { provide: RbacRepository, useValue: mockRepo },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<RbacService>(RbacService);
    repository = module.get<RbacRepository>(RbacRepository);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRole', () => {
    it('should create a role successfully', async () => {
      const dto = { name: 'SiteEngineer', description: 'Field engineer' };
      const res = await service.createRole(dto);
      expect(res).toBeDefined();
      expect(res.name).toEqual('SiteEngineer');
      expect(repository.createRole).toHaveBeenCalledWith(dto);
    });

    it('should throw ConflictException if role name is duplicated', async () => {
      repository.findRoleByName.mockResolvedValueOnce(mockRole);
      const dto = { name: 'SiteEngineer', description: 'Field engineer' };
      await expect(service.createRole(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getRole', () => {
    it('should retrieve a role by ID', async () => {
      const res = await service.getRole('role-uuid-1');
      expect(res).toEqual(mockRole);
      expect(repository.findRoleById).toHaveBeenCalledWith('role-uuid-1');
    });

    it('should throw NotFoundException if role does not exist', async () => {
      repository.findRoleById.mockResolvedValueOnce(null);
      await expect(service.getRole('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteRole', () => {
    it('should soft delete role successfully', async () => {
      const res = await service.deleteRole('role-uuid-1');
      expect(res.success).toBe(true);
      expect(repository.softDeleteRole).toHaveBeenCalledWith('role-uuid-1');
    });

    it('should block deleting Admin role', async () => {
      repository.findRoleById.mockResolvedValueOnce({ ...mockRole, name: 'Admin' });
      await expect(service.deleteRole('role-uuid-admin')).rejects.toThrow(BadRequestException);
    });
  });

  describe('assignPermissionsToRole', () => {
    it('should associate permission keys to role', async () => {
      const assignDto = { permissions: ['anomalies:create'] };
      repository.findPermissionByName.mockResolvedValueOnce(mockPermission);
      
      const res = await service.assignPermissionsToRole('role-uuid-1', assignDto);
      expect(res.success).toBe(true);
      expect(repository.assignPermissionsToRole).toHaveBeenCalled();
    });
  });

  describe('assignRoleToUser', () => {
    it('should complete user role assignment', async () => {
      const assignDto = { userId: 'user-uuid-1', roleName: 'SiteEngineer' };
      repository.findRoleByName.mockResolvedValueOnce(mockRole);

      const res = await service.assignRoleToUser(assignDto);
      expect(res.success).toBe(true);
      expect(repository.assignRoleToUser).toHaveBeenCalledWith('user-uuid-1', 'role-uuid-1', 'SiteEngineer');
    });
  });
});
