import { Test, TestingModule } from '@nestjs/testing';
import { RbacController } from './rbac.controller';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('RbacController (Unit)', () => {
  let controller: RbacController;
  let service: any;

  const mockRole = {
    id: 'role-uuid-1',
    name: 'SiteEngineer',
    description: 'Field engineer',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPermission = {
    id: 'perm-uuid-1',
    name: 'anomalies:create',
    description: 'Create anomalies',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockService = {
      createRole: jest.fn().mockResolvedValue(mockRole),
      updateRole: jest.fn().mockResolvedValue({ ...mockRole, description: 'Updated desc' }),
      getRole: jest.fn().mockResolvedValue(mockRole),
      getAllRoles: jest.fn().mockResolvedValue({ items: [mockRole], meta: { totalItems: 1 } }),
      deleteRole: jest.fn().mockResolvedValue({ success: true, message: 'Deleted' }),
      restoreRole: jest.fn().mockResolvedValue({ success: true, message: 'Restored' }),
      createPermission: jest.fn().mockResolvedValue(mockPermission),
      getAllPermissions: jest.fn().mockResolvedValue({ items: [mockPermission], meta: { totalItems: 1 } }),
      getPermission: jest.fn().mockResolvedValue(mockPermission),
      updatePermission: jest.fn().mockResolvedValue(mockPermission),
      deletePermission: jest.fn().mockResolvedValue({ success: true }),
      assignPermissionsToRole: jest.fn().mockResolvedValue({ success: true }),
      assignRoleToUser: jest.fn().mockResolvedValue({ success: true }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RbacController],
      providers: [
        { provide: RbacService, useValue: mockService },
        { provide: PrismaService, useValue: {} }, // Mocked out for guards
      ],
    }).compile();

    controller = module.get<RbacController>(RbacController);
    service = module.get<RbacService>(RbacService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createRole', () => {
    it('should invoke rbacService.createRole', async () => {
      const dto: CreateRoleDto = { name: 'SiteEngineer', description: 'Field' };
      const result = await controller.createRole(dto);
      expect(result).toEqual(mockRole);
      expect(service.createRole).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAllRoles', () => {
    it('should invoke rbacService.getAllRoles', async () => {
      const queryDto: QueryRoleDto = { page: 1, limit: 10, includeDeleted: false };
      const result = await controller.findAllRoles(queryDto);
      expect(result.items).toBeDefined();
      expect(service.getAllRoles).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('findOneRole', () => {
    it('should invoke rbacService.getRole', async () => {
      const result = await controller.findOneRole('role-uuid-1');
      expect(result).toEqual(mockRole);
      expect(service.getRole).toHaveBeenCalledWith('role-uuid-1');
    });
  });

  describe('updateRole', () => {
    it('should invoke rbacService.updateRole', async () => {
      const dto: UpdateRoleDto = { description: 'Updated desc' };
      const result = await controller.updateRole('role-uuid-1', dto);
      expect(result.description).toEqual('Updated desc');
      expect(service.updateRole).toHaveBeenCalledWith('role-uuid-1', dto);
    });
  });

  describe('removeRole', () => {
    it('should invoke rbacService.deleteRole', async () => {
      const result = await controller.removeRole('role-uuid-1');
      expect(result.success).toBe(true);
      expect(service.deleteRole).toHaveBeenCalledWith('role-uuid-1');
    });
  });

  describe('createPermission', () => {
    it('should invoke rbacService.createPermission', async () => {
      const dto: CreatePermissionDto = { name: 'anomalies:create', description: 'Create' };
      const result = await controller.createPermission(dto);
      expect(result).toEqual(mockPermission);
      expect(service.createPermission).toHaveBeenCalledWith(dto);
    });
  });

  describe('assignPermissionsToRole', () => {
    it('should invoke rbacService.assignPermissionsToRole', async () => {
      const assignDto = { permissions: ['anomalies:create'] };
      await controller.assignPermissionsToRole('role-uuid-1', assignDto);
      expect(service.assignPermissionsToRole).toHaveBeenCalledWith('role-uuid-1', assignDto);
    });
  });

  describe('assignRoleToUser', () => {
    it('should invoke rbacService.assignRoleToUser', async () => {
      const assignDto = { userId: 'user-uuid-1', roleName: 'SiteEngineer' };
      await controller.assignRoleToUser(assignDto);
      expect(service.assignRoleToUser).toHaveBeenCalledWith(assignDto);
    });
  });
});
