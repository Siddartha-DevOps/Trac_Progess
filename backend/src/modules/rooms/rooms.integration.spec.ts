import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { RoomsModule } from './rooms.module';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';

describe('Rooms Module Integration Tests', () => {
  let app: INestApplication;

  // Mock databases stored in memory
  let roomsDb: any[] = [];
  const mockFloor = { id: 'flr-111', name: 'Ground Floor Level', number: 0, buildingId: 'bld-111' };
  const mockBuilding = { id: 'bld-111', name: 'Existing Tower A', projectId: 'proj-111' };
  const mockProject = { id: 'proj-111', name: 'Tech Hub Project', organizationId: 'org-111' };
  const mockUser = { id: 'user-222', email: 'engineer@buildtrace.in', role: 'admin' };

  beforeAll(async () => {
    // Seed initial room
    roomsDb = [
      {
        id: 'room-111',
        name: 'Office 101',
        category: 'OFFICE',
        status: 'PLANNING',
        description: 'First floor office',
        totalArea: 150.0,
        height: 9.0,
        perimeter: 50.0,
        geometry: null,
        metadata: {},
        floorId: 'flr-111',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    const mockPrismaService = {
      floor: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'flr-111') {
            return Promise.resolve({
              ...mockFloor,
              building: mockBuilding,
            });
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
      room: {
        create: jest.fn().mockImplementation(({ data }) => {
          const newRoom = {
            id: `room-${Math.floor(Math.random() * 1000)}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          };
          roomsDb.push(newRoom);
          return Promise.resolve(newRoom);
        }),
        findMany: jest.fn().mockImplementation(({ where, skip, take }) => {
          let list = [...roomsDb];

          if (where?.deletedAt === null) {
            list = list.filter(r => r.deletedAt === null);
          }
          if (where?.floorId) {
            list = list.filter(r => r.floorId === where.floorId);
          }
          if (where?.status) {
            list = list.filter(r => r.status === where.status);
          }
          if (where?.category) {
            list = list.filter(r => r.category === where.category);
          }
          if (where?.OR) {
            const search = where.OR[0].name.contains.toLowerCase();
            list = list.filter(
              r =>
                r.name.toLowerCase().includes(search) ||
                (r.description && r.description.toLowerCase().includes(search)),
            );
          }

          // Sort by name
          list.sort((a, b) => a.name.localeCompare(b.name));

          const pageList = list.slice(skip || 0, (skip || 0) + (take || 10));
          return Promise.resolve(pageList);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const match = roomsDb.find(r => r.id === where.id);
          if (match) {
            return Promise.resolve({
              ...match,
              floor: {
                ...mockFloor,
                building: {
                  ...mockBuilding,
                  project: mockProject,
                },
              },
            });
          }
          return Promise.resolve(null);
        }),
        findFirst: jest.fn().mockImplementation(({ where }) => {
          let match = null;
          if (where?.name) {
            const name = where.name.equals?.toLowerCase() || where.name.toLowerCase();
            match = roomsDb.find(
              r => r.name.toLowerCase() === name && r.floorId === where.floorId && r.deletedAt === null,
            );
          }
          return Promise.resolve(match || null);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const index = roomsDb.findIndex(r => r.id === where.id);
          if (index === -1) return Promise.resolve(null);
          const updated = {
            ...roomsDb[index],
            ...data,
            updatedAt: new Date(),
          };
          roomsDb[index] = updated;
          return Promise.resolve(updated);
        }),
        count: jest.fn().mockImplementation(({ where }) => {
          let list = [...roomsDb];
          if (where?.deletedAt === null) {
            list = list.filter(r => r.deletedAt === null);
          }
          if (where?.floorId) {
            list = list.filter(r => r.floorId === where.floorId);
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
      imports: [RoomsModule],
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

  describe('POST /rooms', () => {
    it('should successfully create a room when payload is valid', async () => {
      const payload = {
        name: 'Conference Room A',
        category: 'CONFERENCE',
        status: 'PLANNING',
        description: 'Large conference area',
        totalArea: 350.0,
        height: 10.0,
        perimeter: 80.0,
        geometry: { type: 'Polygon', coordinates: [] },
        metadata: { setupType: 'Boardroom' },
        floorId: 'flr-111',
      };

      const res = await request(app.getHttpServer())
        .post('/rooms')
        .send(payload)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Conference Room A');
      expect(res.body.floorId).toBe('flr-111');
      expect(res.body.category).toBe('CONFERENCE');
    });

    it('should reject creation if floor ID is unrecognized', async () => {
      const payload = {
        name: 'Office 102',
        floorId: 'flr-missing-999',
      };

      await request(app.getHttpServer())
        .post('/rooms')
        .send(payload)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('should reject creation if room name already exists on that floor', async () => {
      const payload = {
        name: 'Office 101', // conflicts with initial seeded Office 101
        floorId: 'flr-111',
      };

      await request(app.getHttpServer())
        .post('/rooms')
        .send(payload)
        .expect(HttpStatus.CONFLICT);
    });
  });

  describe('GET /rooms', () => {
    it('should retrieve a paginated list of rooms', async () => {
      const res = await request(app.getHttpServer())
        .get('/rooms')
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.meta.currentPage).toBe(1);
    });

    it('should filter correctly by category', async () => {
      const res = await request(app.getHttpServer())
        .get('/rooms')
        .query({ category: 'OFFICE' })
        .expect(HttpStatus.OK);

      expect(res.body.items.every((r: any) => r.category === 'OFFICE')).toBe(true);
    });
  });

  describe('GET /rooms/:id', () => {
    it('should retrieve metadata for specified room ID', async () => {
      const res = await request(app.getHttpServer())
        .get('/rooms/room-111')
        .expect(HttpStatus.OK);

      expect(res.body.id).toBe('room-111');
      expect(res.body.name).toBe('Office 101');
    });

    it('should throw 404 for unrecognized room ID', async () => {
      await request(app.getHttpServer())
        .get('/rooms/room-missing-999')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PATCH /rooms/:id', () => {
    it('should update partial attributes correctly', async () => {
      const payload = { totalArea: 165.5, status: 'COMPLETED' };

      const res = await request(app.getHttpServer())
        .patch('/rooms/room-111')
        .send(payload)
        .expect(HttpStatus.OK);

      expect(res.body.totalArea).toBe(165.5);
      expect(res.body.status).toBe('COMPLETED');
    });
  });

  describe('DELETE /rooms/:id', () => {
    it('should soft-delete room', async () => {
      const res = await request(app.getHttpServer())
        .delete('/rooms/room-111')
        .expect(HttpStatus.OK);

      expect(res.body.deletedAt).not.toBeNull();
    });
  });

  describe('POST /rooms/:id/restore', () => {
    it('should restore soft-deleted room', async () => {
      const res = await request(app.getHttpServer())
        .post('/rooms/room-111/restore')
        .expect(HttpStatus.OK);

      expect(res.body.deletedAt).toBeNull();
    });
  });
});
