import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from './users.module';
import { UsersService } from './users.service';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('Users API (Integration)', () => {
  let app: INestApplication;
  let mockService: any;

  const mockUserList = [
    {
      id: 'user-uuid-1111',
      email: 'arjun@buildtrace.in',
      firstName: 'Arjun',
      lastName: 'Sharma',
      role: 'SiteEngineer',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: false,
      organizationId: 'org-uuid-999',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    },
    {
      id: 'user-uuid-2222',
      email: 'karan@buildtrace.in',
      firstName: 'Karan',
      lastName: 'Kapoor',
      role: 'Auditor',
      isActive: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      organizationId: 'org-uuid-999',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    },
  ];

  beforeAll(async () => {
    mockService = {
      create: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'user-uuid-created', ...dto, isEmailVerified: false, isPhoneVerified: false, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })),
      update: jest.fn().mockImplementation((id, dto) => Promise.resolve({ id, email: 'arjun@buildtrace.in', firstName: dto.firstName || 'Arjun', lastName: 'Sharma', role: 'SiteEngineer', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })),
      findOne: jest.fn().mockImplementation((id) => {
        const found = mockUserList.find(u => u.id === id);
        return found ? Promise.resolve(found) : Promise.reject({ status: 404, message: 'Not Found' });
      }),
      findAll: jest.fn().mockResolvedValue({
        items: mockUserList,
        meta: {
          totalItems: 2,
          itemCount: 2,
          itemsPerPage: 10,
          totalPages: 1,
          currentPage: 1,
        }
      }),
      softDelete: jest.fn().mockImplementation((id) => Promise.resolve({ id, deletedAt: new Date().toISOString(), isActive: false })),
      restore: jest.fn().mockImplementation((id) => Promise.resolve({ id, deletedAt: null, isActive: true })),
      invite: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'invited-user-id', ...dto, isActive: false, invitationToken: 'invite_token_9999' })),
      acceptInvitation: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'user-uuid-activated', email: 'invited@buildtrace.in', isActive: true, invitationAccepted: true })),
      requestPasswordReset: jest.fn().mockResolvedValue({ success: true, message: 'Dispatched' }),
      resetPassword: jest.fn().mockImplementation((dto) => Promise.resolve({ id: 'user-uuid-reset', email: 'reset@buildtrace.in', isActive: true })),
      verifyEmail: jest.fn().mockResolvedValue({ id: 'user-uuid-verified', isEmailVerified: true }),
      requestPhoneVerification: jest.fn().mockResolvedValue({ success: true, code: '554321' }),
      verifyPhone: jest.fn().mockResolvedValue({ id: 'user-uuid-phone-verified', isPhoneVerified: true }),
      updatePreferences: jest.fn().mockImplementation((id, dto) => Promise.resolve({ id, preferences: dto })),
      deactivate: jest.fn().mockImplementation((id) => Promise.resolve({ id, isActive: false })),
      activate: jest.fn().mockImplementation((id) => Promise.resolve({ id, isActive: true })),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(UsersService)
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

  it('POST /api/v1/users -> should register user profile', async () => {
    const payload = {
      email: 'arjun@buildtrace.in',
      firstName: 'Arjun',
      lastName: 'Sharma',
      password: 'SecurePassword2026',
      organizationId: 'org-uuid-999',
      role: 'SiteEngineer',
    };

    return request(app.getHttpServer())
      .post('/api/v1/users')
      .send(payload)
      .expect(201)
      .expect((res) => {
        expect(res.body.id).toEqual('user-uuid-created');
        expect(res.body.email).toEqual('arjun@buildtrace.in');
        expect(mockService.create).toHaveBeenCalled();
      });
  });

  it('GET /api/v1/users -> should fetch paginated operators list', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/users')
      .expect(200)
      .expect((res) => {
        expect(res.body.items).toHaveLength(2);
        expect(res.body.meta.totalItems).toEqual(2);
        expect(mockService.findAll).toHaveBeenCalled();
      });
  });

  it('GET /api/v1/users/:id -> should fetch target user profile details', async () => {
    return request(app.getHttpServer())
      .get('/api/v1/users/user-uuid-1111')
      .expect(200)
      .expect((res) => {
        expect(res.body.firstName).toEqual('Arjun');
        expect(mockService.findOne).toHaveBeenCalledWith('user-uuid-1111');
      });
  });

  it('PATCH /api/v1/users/:id -> should update name details', async () => {
    const patchPayload = { firstName: 'Arjun-Updated' };
    return request(app.getHttpServer())
      .patch('/api/v1/users/user-uuid-1111')
      .send(patchPayload)
      .expect(200)
      .expect((res) => {
        expect(res.body.firstName).toEqual('Arjun-Updated');
        expect(mockService.update).toHaveBeenCalled();
      });
  });

  it('POST /api/v1/users/invite -> should trigger team invitations', async () => {
    const invitePayload = {
      email: 'new@buildtrace.in',
      firstName: 'Rohan',
      lastName: 'Verma',
      role: 'SiteEngineer',
      organizationId: 'org-uuid-999',
    };

    return request(app.getHttpServer())
      .post('/api/v1/users/invite')
      .send(invitePayload)
      .expect(201)
      .expect((res) => {
        expect(res.body.invitationToken).toBeDefined();
        expect(mockService.invite).toHaveBeenCalled();
      });
  });

  it('POST /api/v1/users/accept-invitation -> should complete registration', async () => {
    const acceptPayload = {
      token: 'invite_token_9999',
      password: 'StrongOnboardingPassword2026!',
    };

    return request(app.getHttpServer())
      .post('/api/v1/users/accept-invitation')
      .send(acceptPayload)
      .expect(200)
      .expect((res) => {
        expect(res.body.invitationAccepted).toBeTruthy();
        expect(mockService.acceptInvitation).toHaveBeenCalled();
      });
  });

  it('POST /api/v1/users/:id/deactivate -> should suspend profile accounts', async () => {
    return request(app.getHttpServer())
      .post('/api/v1/users/user-uuid-1111/deactivate')
      .expect(200)
      .expect((res) => {
        expect(res.body.isActive).toBeFalsy();
        expect(mockService.deactivate).toHaveBeenCalledWith('user-uuid-1111');
      });
  });
});
