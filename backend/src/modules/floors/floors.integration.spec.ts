import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { FloorsModule } from './floors.module';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';

describe('Floors Module Integration Tests', () => {
  let app: INestApplication;

  // Mock databases stored in memory
  let floorsDb: any[] = [];
  const mockBuilding = { id: 'bld-111', name: 'Existing Tower A', projectId: 'proj-111' };
  const mockProject = { id: 'proj-111', name: 'Tech Hub Project', organizationId: 'org-111' };
  const mockUser = { id: 'user-222', email: 'engineer@buildtrace.in', role: 'admin' };

  beforeAll(async () => {
    // Seed initial floor
    floorsDb = [
      {
        id: 'floor-111',
        name: 'Ground Floor',
        description: 'First residential lobby level',
        number: 0,
        order: 0,
        totalArea: 4000.0,
        status: 'PLANNING',
        metadata: {},
        buildingId: 'bld-111',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    const mockPrismaService = {
      building: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'bld-111') {
            return Promise.resolve(mockBuilding);
          }
          return Promise.resolve(null);
        }),
      },
      project: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'proj-111') {
            return Promise.resolve(mockProject);
          }
          return Promise.resolve(null);
        }),
      },
      floor: {
        create: jest.fn().mockImplementation(({ data }) => {
          const newFloor = {
            id: `floor-${Math.floor(Math.random() * 1000)}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          };
          floorsDb.push(newFloor);
          return Promise.resolve(newFloor);
        }),
        findMany: jest.fn().mockImplementation(({ where, skip, take }) => {
          let list = [...floorsDb];

          if (where?.deletedAt === null) {
            list = list.filter(f => f.deletedAt === null);
          }
          if (where?.buildingId) {
            list = list.filter(f => f.buildingId === where.buildingId);
          }
          if (where?.status) {
            list = list.filter(f => f.status === where.status);
          }
          if (where?.OR) {
            const search = where.OR[0].name.contains.toLowerCase();
            list = list.filter(
              f =>
                f.name.toLowerCase().includes(search) ||
                (f.description && f.description.toLowerCase().includes(search)),
            );
          }

          // Sort by order index
          list.sort((a, b) => a.order - b.order);

          const pageList = list.slice(skip || 0, (skip || 0) + (take || 10));
          return Promise.resolve(pageList);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const match = floorsDb.find(f => f.id === where.id);
          if (match) {
            return Promise.resolve({
              ...match,
              building: {
                ...mockBuilding,
                project: mockProject,
              },
            });
          }
          return Promise.resolve(null);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          let match = null;
          if (where?.number !== undefined) {
            match = floorsDb.find(
              f => f.number === where.number && f.buildingId === where.buildingId && f.deletedAt === null,
            );
          } else if (where?.name) {
            const name = where.name.equals?.toLowerCase() || where.name.toLowerCase();
            match = floorsDb.find(
              f => f.name.toLowerCase() === name && f.buildingId === where.buildingId && f.deletedAt === null,
            );
          }
          return Promise.resolve(match || null);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const index = floorsDb.findIndex(f => f.id === where.id);
          if (index === -1) return Promise.resolve(null);
          const updated = {
            ...floorsDb[index],
            ...data,
            updatedAt: new Date(),
          };
          floorsDb[index] = updated;
          return Promise.resolve(updated);
        }),
        count: jest.fn().mockImplementation(({ where }) => {
          let list = [...floorsDb];
          if (where?.deletedAt === null) {
            list = list.filter(f => f.deletedAt === null);
          }
          if (where?.buildingId) {
            list = list.filter(f => f.buildingId === where.buildingId);
          }
          return Promise.resolve(list.length);
        }),
      },
      $transaction: jest.fn().mockImplementation((promises) => {
        return Promise.all(promises);
      }),
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
      imports: [FloorsModule],
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

  describe('POST /floors', () => {
    it('should successfully create a floor when payload is valid', async () => {
      const payload = {
        name: 'First Floor',
        description: 'First floor office grid',
        number: 1,
        order: 1,
        totalArea: 4500.0,
        status: 'PLANNING',
        metadata: { columnsCount: 24 },
        buildingId: 'bld-111',
      };

      const res = await request(app.getHttpServer())
        .post('/floors')
        .send(payload)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('First Floor');
      expect(res.body.buildingId).toBe('bld-111');
      expect(res.body.number).toBe(1);
    });

    it('should reject creation if building ID is unrecognized', async () => {
      const payload = {
        name: 'Second Floor',
        number: 2,
        order: 2,
        buildingId: 'bld-missing-999',
      };

      await request(app.getHttpServer())
        .post('/floors')
        .send(payload)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should reject creation if level number already exists', async () => {
      const payload = {
        name: 'Ground Floor Backup',
        number: 0, // conflicts with Ground Floor (number: 0)
        order: 5,
        buildingId: 'bld-111',
      };

      await request(app.getHttpServer())
        .post('/floors')
        .send(payload)
        .expect(HttpStatus.CONFLICT);
    });

    it('should reject creation if name already exists', async () => {
      const payload = {
        name: 'Ground Floor', // conflicts with Ground Floor name
        number: 10,
        order: 10,
        buildingId: 'bld-111',
      };

      await request(app.getHttpServer())
        .post('/floors')
        .send(payload)
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('GET /floors', () => {
    it('should retrieve a paginated list of floors', async () => {
      const res = await request(app.getHttpServer())
        .get('/floors')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta.currentPage).toBe(1);
    });

    it('should filter correctly by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/floors')
        .query({ status: 'PLANNING' })
        .expect(HttpStatus.OK);

      expect(res.body.items.every((f: any) => f.status === 'PLANNING')).toBe(true);
    });
  });

  describe('GET /floors/:id', () => {
    it('should retrieve metadata for specified floor ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/floors/floor-111')
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe('floor-111');
      expect(res.body.name).toBe('Ground Floor');
      expect(res.body.number).toBe(0);
    });

    it('should throw 404 for unrecognized floor ID', async () => {
      await request(app.getHttpServer())
        .get('/floors/floor-missing-999')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /floors/:id', () => {
    it('should update partial attributes correctly', async () => {
      const payload = { totalArea: 4100.5, status: 'UNDER_CONSTRUCTION' };

      const res = await request(app.getHttpServer())
        .patch('/floors/floor-111')
        .send(payload)
        .expect(HttpStatus.OK);

      expect(res.body.totalArea).toBe(4100.5);
      expect(res.body.status).toBe('UNDER_CONSTRUCTION');
    });
  });

  describe('POST /floors/reorder', () => {
    it('should reorder floors sorting sequence successfully', async () => {
      const payload = {
        orderedIds: ['floor-111'],
      };

      await request(app.getHttpServer())
        .post('/floors/reorder')
        .send(payload)
        .expect(HttpStatus.OK);
    });
  });

  describe('DELETE /floors/:id', () => {
    it('should soft-delete floor', async () => {
      const res = await request(app.getHttpServer())
        .delete('/floors/floor-111')
        .expect(HttpStatus.OK);

      expect(res.body.deletedAt).not.toBeNull();
    });
  });

  describe('POST /floors/:id/restore', () => {
    it('should restore soft-deleted floor', async () => {
      const res = await request(app.getHttpServer())
        .post('/floors/floor-111/restore')
        .expect(HttpStatus.OK);

      expect(res.body.deletedAt).toBeNull();
    });
  });
});
