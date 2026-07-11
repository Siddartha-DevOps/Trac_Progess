import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { BuildingsModule } from './buildings.module';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';

describe('Buildings Module Integration Tests', () => {
  let app: INestApplication;

  // Mock databases stored in memory
  let buildingsDb: any[] = [];
  const mockProject = { id: 'proj-111', name: 'Existing Project One', organizationId: 'org-111' };
  const mockUser = { id: 'user-222', email: 'engineer@buildtrace.in', role: 'admin' };

  beforeAll(async () => {
    // Seed initial building
    buildingsDb = [
      {
        id: 'bld-111',
        name: 'Existing Tower A',
        description: 'First residential block',
        type: 'RESIDENTIAL',
        status: 'PLANNING',
        floors: 12,
        basementFloors: 1,
        totalArea: 65000.0,
        parkingSpaces: 80,
        metadata: {},
        address: 'Electronics City Phase 1',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560100',
        latitude: 12.845,
        longitude: 77.663,
        projectId: 'proj-111',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    const mockPrismaService = {
      project: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'proj-111') {
            return Promise.resolve(mockProject);
          }
          return Promise.resolve(null);
        }),
      },
      building: {
        create: jest.fn().mockImplementation(({ data }) => {
          const newBld = {
            id: `bld-${Math.floor(Math.random() * 1000)}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          };
          buildingsDb.push(newBld);
          return Promise.resolve(newBld);
        }),
        findMany: jest.fn().mockImplementation(({ where, skip, take }) => {
          let list = [...buildingsDb];

          if (where?.deletedAt === null) {
            list = list.filter(b => b.deletedAt === null);
          }
          if (where?.projectId) {
            list = list.filter(b => b.projectId === where.projectId);
          }
          if (where?.status) {
            list = list.filter(b => b.status === where.status);
          }
          if (where?.type) {
            list = list.filter(b => b.type === where.type);
          }
          if (where?.OR) {
            const search = where.OR[0].name.contains.toLowerCase();
            list = list.filter(
              b =>
                b.name.toLowerCase().includes(search) ||
                (b.description && b.description.toLowerCase().includes(search)) ||
                (b.address && b.address.toLowerCase().includes(search)) ||
                (b.city && b.city.toLowerCase().includes(search)),
            );
          }

          // Apply mock offset limit pagination
          const pageList = list.slice(skip || 0, (skip || 0) + (take || 10));
          return Promise.resolve(pageList);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const match = buildingsDb.find(b => b.id === where.id);
          return Promise.resolve(match || null);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          const name = where?.name?.equals?.toLowerCase() || where?.name?.toLowerCase();
          const match = buildingsDb.find(
            b => b.name.toLowerCase() === name && b.projectId === where?.projectId && b.deletedAt === null,
          );
          return Promise.resolve(match || null);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const index = buildingsDb.findIndex(b => b.id === where.id);
          if (index === -1) return Promise.resolve(null);
          const updated = {
            ...buildingsDb[index],
            ...data,
            updatedAt: new Date(),
          };
          buildingsDb[index] = updated;
          return Promise.resolve(updated);
        }),
        count: jest.fn().mockImplementation(({ where }) => {
          let list = [...buildingsDb];
          if (where?.deletedAt === null) {
            list = list.filter(b => b.deletedAt === null);
          }
          if (where?.projectId) {
            list = list.filter(b => b.projectId === where.projectId);
          }
          return Promise.resolve(list.length);
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
      imports: [BuildingsModule],
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

  describe('POST /buildings', () => {
    it('should create a building when payload is fully compliant', async () => {
      const payload = {
        name: 'Tower B',
        description: 'Commercial corporate tower',
        type: 'COMMERCIAL',
        status: 'PLANNING',
        floors: 22,
        basementFloors: 3,
        totalArea: 140000.0,
        parkingSpaces: 250,
        metadata: { client: 'Airtel India' },
        address: 'Bannerghatta Road',
        city: 'Bangalore',
        state: 'Karnataka',
        postalCode: '560076',
        latitude: 12.895,
        longitude: 77.598,
        projectId: 'proj-111',
      };

      const res = await request(app.getHttpServer())
        .post('/buildings')
        .send(payload)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Tower B');
      expect(res.body.projectId).toBe('proj-111');
      expect(res.body.floors).toBe(22);
    });

    it('should reject creation if required projectId is missing', async () => {
      const payload = { name: 'Tower C' };

      await request(app.getHttpServer())
        .post('/buildings')
        .send(payload)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject creation if associated project is unrecognized', async () => {
      const payload = {
        name: 'Tower D',
        projectId: 'proj-missing-999',
      };

      await request(app.getHttpServer())
        .post('/buildings')
        .send(payload)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should enforce unique constraint of name inside the same project', async () => {
      const payload = {
        name: 'Existing Tower A',
        projectId: 'proj-111',
      };

      await request(app.getHttpServer())
        .post('/buildings')
        .send(payload)
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('GET /buildings', () => {
    it('should retrieve list of active buildings with default pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/buildings')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta.currentPage).toBe(1);
    });

    it('should filter buildings correctly by type', async () => {
      const res = await request(app.getHttpServer())
        .get('/buildings')
        .query({ type: 'RESIDENTIAL' })
        .expect(HttpStatus.OK);

      expect(res.body.items.every((b: any) => b.type === 'RESIDENTIAL')).toBe(true);
    });
  });

  describe('GET /buildings/:id', () => {
    it('should retrieve full metadata for specified building', async () => {
      const res = await request(app.getHttpServer())
        .get('/buildings/bld-111')
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe('bld-111');
      expect(res.body.name).toBe('Existing Tower A');
      expect(res.body.floors).toBe(12);
    });

    it('should throw 404 for unrecognized building', async () => {
      await request(app.getHttpServer())
        .get('/buildings/bld-missing-999')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /buildings/:id', () => {
    it('should update partial attributes correctly', async () => {
      const payload = { floors: 16, status: 'UNDER_CONSTRUCTION' };

      const res = await request(app.getHttpServer())
        .patch('/buildings/bld-111')
        .send(payload)
        .expect(HttpStatus.OK);

      expect(res.body.floors).toBe(16);
      expect(res.body.status).toBe('UNDER_CONSTRUCTION');
    });
  });

  describe('DELETE /buildings/:id', () => {
    it('should soft-delete building by setting deletedAt', async () => {
      const res = await request(app.getHttpServer())
        .delete('/buildings/bld-111')
        .expect(HttpStatus.OK);

      expect(res.body.deletedAt).not.toBeNull();
    });
  });

  describe('POST /buildings/:id/restore', () => {
    it('should restore soft-deleted building', async () => {
      const res = await request(app.getHttpServer())
        .post('/buildings/bld-111/restore')
        .expect(HttpStatus.OK);

      expect(res.body.deletedAt).toBeNull();
    });
  });

  describe('GET /buildings/analytics/:projectId', () => {
    it('should compile correct project-specific analytics', async () => {
      const res = await request(app.getHttpServer())
        .get('/buildings/analytics/proj-111')
        .expect(HttpStatus.OK);

      expect(res.body.projectId).toBe('proj-111');
      expect(res.body).toHaveProperty('totalBuildings');
      expect(res.body).toHaveProperty('statusBreakdown');
      expect(res.body).toHaveProperty('typeBreakdown');
    });
  });
});
