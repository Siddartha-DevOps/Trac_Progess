import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { RbacModule } from './rbac.module';
import { RbacService } from './rbac.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('RBAC API (Integration)', () => {
  let app: INestApplication;
  let mockService: any;

  const mockRoleList = [
    {
      id: 'role-uuid-1',
      name: 'Admin',
      description: 'Super administrator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      permissions: [{ id: 'p-1', name: 'users:create' }],
    },
    {
      id: 'role-uuid-2',
      name: 'SiteEngineer',
      description: 'Field operation supervisor',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
      permissions: [],
    },
  ];

  const mockPermissionList = [
    {
      id: 'perm-uuid-1',
      name: 'anomalies:create',
      description: 'Create anomalies',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'perm-uuid-2',
      name: 'anomalies:view',
      description: 'View anomalies',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  beforeAll(async () => {
    mockService = {
      createRole: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'role-uuid-created', ...dto, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })),
      updateRole: jest.fn().mockImplementation((id, dto) => Promise.resolve({ id, name: 'SiteEngineer', description: dto.description, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })),
      getRole: jest.fn().mockImplementation((id) => {
        const found = mockRoleList.find(r => r.id === id);
        return found ? Promise.resolve(found) : Promise.reject({ status: 404, message: 'Not Found' });
      }),
      getAllRoles: jest.fn().mockResolvedValue({
        items: mockRoleList,
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        }
      }),
      deleteRole: jest.fn().mockResolvedValue({ success: true, message: 'Role deleted' }),
      restoreRole: jest.fn().mockResolvedValue({ success: true, message: 'Role restored' }),
      createPermission: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'perm-uuid-created', name: dto.name, description: dto.description, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })),
      getAllPermissions: jest.fn().mockResolvedValue({
        items: mockPermissionList,
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        }
      }),
      getPermission: jest.fn().mockImplementation((id) => {
        const found = mockPermissionList.find(p => p.id === id);
        return found ? Promise.resolve(found) : Promise.reject({ status: 404, message: 'Not Found' });
      }),
      updatePermission: jest.fn().mockImplementation((id, dto) => Promise.resolve({ id, name: 'anomalies:create', description: dto.description, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })),
      deletePermission: jest.fn().mockResolvedValue({ success: true, message: 'Permission deleted' }),
      assignPermissionsToRole: jest.fn().mockResolvedValue({ success: true, message: 'Permissions assigned' }),
      assignRoleToUser: jest.fn().mockResolvedValue({ success: true, message: 'Role assigned' }),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [RbacModule],
    })
      .overrideProvider(RbacService)
      .useValue(mockService)
      .overrideProvider(PrismaService)
      .useValue({
        $connect: jest.fn(),
        $disconnect: jest.fn(),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /rbac/roles -> should register role profile', async () => {
    const payload = {
      name: 'SafetyOfficer',
      description: 'Manages site safety drills and incident logs',
    };

    return request(app.getHttpServer())
      .post('/rbac/roles')
      .set('x-user-role', 'Admin') // Mock user header parsed by AuthGuard
      .send(payload)
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toEqual('role-uuid-created');
        expect(res.body.name).toEqual('SafetyOfficer');
        expect(mockService.createRole).toHaveBeenCalled();
      });
  });

  it('GET /rbac/roles -> should fetch paginated roles list', async () => {
    return request(app.getHttpServer())
      .get('/rbac/roles')
      .set('x-user-role', 'Admin')
      .expect(200)
      .expect((res) => {
        expect(res.body.items).toHaveLength(2);
        expect(res.body.meta.totalItems).toEqual(2);
        expect(mockService.getAllRoles).toHaveBeenCalled();
      });
  });

  it('POST /rbac/permissions -> should register programmatic permission', async () => {
    const payload = {
      name: 'anomalies:approve',
      description: 'Enables resolving or closing raised concrete anomalies',
    };

    return request(app.getHttpServer())
      .post('/rbac/permissions')
      .set('x-user-role', 'Admin')
      .send(payload)
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toEqual('perm-uuid-created');
        expect(res.body.name).toEqual('anomalies:approve');
        expect(mockService.createPermission).toHaveBeenCalled();
      });
  });

  it('POST /rbac/roles/:id/permissions -> should map permission keys to role', async () => {
    const payload = {
      permissions: ['anomalies:create', 'anomalies:view'],
    };

    return request(app.getHttpServer())
      .post('/rbac/roles/role-uuid-2/permissions')
      .set('x-user-role', 'Admin')
      .send(payload)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBeTruthy();
        expect(mockService.assignPermissionsToRole).toHaveBeenCalled();
      });
  });

  it('POST /rbac/assign-role -> should promote user to privilege role', async () => {
    const payload = {
      userId: '4f208170-ee6f-4f7f-8e40-a35948924b42',
      roleName: 'SiteEngineer',
    };

    return request(app.getHttpServer())
      .post('/rbac/assign-role')
      .set('x-user-role', 'Admin')
      .send(payload)
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBeTruthy();
        expect(mockService.assignRoleToUser).toHaveBeenCalled();
      });
  });
});
