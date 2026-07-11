import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { VideosModule } from './videos.module';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';

describe('Videos Module Integration Tests', () => {
  let app: INestApplication;

  let videosDb: any[] = [];
  let sessionsDb: any[] = [];
  const mockProject = { id: 'proj-111', name: 'Existing Mega Project', organizationId: 'org-111' };
  const mockUser = { id: 'user-222', email: 'engineer@buildtrace.in', role: 'admin' };

  beforeAll(async () => {
    videosDb = [
      {
        id: 'video-111',
        name: 'Initial Drone Survey',
        description: 'First floor baseline scan',
        fileSize: 52428800,
        mimeType: 'video/mp4',
        is360: false,
        status: 'COMPLETED',
        compressionStatus: 'COMPLETED',
        projectId: 'proj-111',
        uploadedById: 'user-222',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    sessionsDb = [];

    const mockPrismaService = {
      project: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'proj-111') {
            return Promise.resolve(mockProject);
          }
          return Promise.resolve(null);
        }),
      },
      video: {
        create: jest.fn().mockImplementation(({ data }) => {
          const newVideo = {
            id: `video-${Math.floor(Math.random() * 1000)}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          };
          videosDb.push(newVideo);
          return Promise.resolve(newVideo);
        }),
        findMany: jest.fn().mockImplementation(({ where, skip, take }) => {
          let list = [...videosDb];
          if (where?.deletedAt === null) {
            list = list.filter((v) => v.deletedAt === null);
          }
          if (where?.projectId) {
            list = list.filter((v) => v.projectId === where.projectId);
          }
          if (where?.is360 !== undefined) {
            list = list.filter((v) => v.is360 === where.is360);
          }
          if (where?.status) {
            list = list.filter((v) => v.status === where.status);
          }
          if (where?.OR) {
            const search = where.OR[0].name.contains.toLowerCase();
            list = list.filter(
              (v) =>
                v.name.toLowerCase().includes(search) ||
                (v.description && v.description.toLowerCase().includes(search)),
            );
          }
          return Promise.resolve(list.slice(skip || 0, (skip || 0) + (take || 10)));
        }),
        count: jest.fn().mockImplementation(({ where }) => {
          let list = [...videosDb];
          if (where?.deletedAt === null) {
            list = list.filter((v) => v.deletedAt === null);
          }
          return Promise.resolve(list.length);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          const v = videosDb.find((item) => item.id === where.id && (where.deletedAt === null ? item.deletedAt === null : true));
          return Promise.resolve(v || null);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const idx = videosDb.findIndex((v) => v.id === where.id);
          if (idx !== -1) {
            videosDb[idx] = { ...videosDb[idx], ...data, updatedAt: new Date() };
            return Promise.resolve(videosDb[idx]);
          }
          return Promise.resolve(null);
        }),
      },
      videoUploadSession: {
        create: jest.fn().mockImplementation(({ data }) => {
          const newSession = {
            id: `session-${Math.floor(Math.random() * 1000)}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          sessionsDb.push(newSession);
          return Promise.resolve(newSession);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const s = sessionsDb.find((item) => item.uploadToken === where.uploadToken);
          return Promise.resolve(s || null);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const idx = sessionsDb.findIndex((s) => s.id === where.id);
          if (idx !== -1) {
            sessionsDb[idx] = { ...sessionsDb[idx], ...data, updatedAt: new Date() };
            return Promise.resolve(sessionsDb[idx]);
          }
          return Promise.resolve(null);
        }),
      },
    };

    const mockAuditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const mockAuthGuard = {
      canActivate: (context: any) => {
        const req = context.switchToHttp().getRequest();
        req.user = mockUser;
        return true;
      },
    };

    const mockPermissionsGuard = {
      canActivate: () => true,
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [VideosModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(AuditService)
      .useValue(mockAuditService)
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(PermissionsGuard)
      .useValue(mockPermissionsGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /videos/init - Success', async () => {
    const payload = {
      name: 'Tower B Level 3 Scan',
      description: 'Progress scan slab reinforcement',
      fileSize: 104857600, 
      mimeType: 'video/mp4',
      projectId: 'proj-111',
      is360: true,
    };

    const response = await request(app.getHttpServer())
      .post('/videos/init')
      .send(payload)
      .expect(HttpStatus.CREATED);

    expect(response.body).toBeDefined();
    expect(response.body.uploadToken).toBeDefined();
    expect(response.body.totalChunks).toBe(20);
    expect(response.body.videoId).toBeDefined();
  });

  it('POST /videos/init - Bad Request (Mime Type)', async () => {
    const payload = {
      name: 'Corrupted Scan',
      fileSize: 50000,
      mimeType: 'application/pdf',
      projectId: 'proj-111',
    };

    await request(app.getHttpServer())
      .post('/videos/init')
      .send(payload)
      .expect(HttpStatus.BAD_REQUEST);
  });

  it('GET /videos - Fetch List', async () => {
    const response = await request(app.getHttpServer())
      .get('/videos')
      .query({ projectId: 'proj-111' })
      .expect(HttpStatus.OK);

    expect(response.body).toBeDefined();
    expect(response.body.items.length).toBeGreaterThanOrEqual(1);
  });

  it('GET /videos/:id - Success', async () => {
    const response = await request(app.getHttpServer())
      .get('/videos/video-111')
      .expect(HttpStatus.OK);

    expect(response.body.id).toBe('video-111');
    expect(response.body.name).toBe('Initial Drone Survey');
  });

  it('DELETE /videos/:id - Soft Delete', async () => {
    await request(app.getHttpServer())
      .delete('/videos/video-111')
      .expect(HttpStatus.OK);

    const response = await request(app.getHttpServer())
      .get('/videos')
      .expect(HttpStatus.OK);

    const hasDeleted = response.body.items.some((v: any) => v.id === 'video-111');
    expect(hasDeleted).toBe(false);
  });
});
