import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { BimModule } from './bim.module';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';

describe('BIM Module Integration Tests', () => {
  let app: INestApplication;

  // In-memory mock database
  let bimModelsDb: any[] = [];
  let bimElementsDb: any[] = [];

  const mockProject = { id: 'proj-111', name: 'Tech Hub Office', organizationId: 'org-111' };
  const mockUser = { id: 'user-333', email: 'siteauditor@buildtrace.in', role: 'admin' };

  beforeAll(async () => {
    // Reset databases
    bimModelsDb = [
      {
        id: 'model-111',
        name: 'Block A Structural',
        description: 'First version structural bounds',
        fileUrl: 'https://storage.buildtrace.in/models/bld-111_v1.ifc',
        fileType: 'IFC',
        version: 1,
        status: 'COMPLETED',
        coordinateSystem: { crs: 'EPSG:3857', origin: [0, 0, 0] },
        metadata: {},
        projectId: 'proj-111',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      },
    ];

    bimElementsDb = [
      {
        id: 'el-111',
        externalId: 'IFC-WALL-0192A9',
        name: 'Concrete Wall Standard Case [C25/30]',
        type: 'IFCWALLSTANDARDCASE',
        category: 'Structural',
        geometry: { boundingBox: { min: [0, 0, 0], max: [5, 0.3, 3] } },
        properties: { Volume: '4.5 cum', Area: '15.0 sqm' },
        modelId: 'model-111',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const mockPrismaService = {
      project: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'proj-111') return Promise.resolve(mockProject);
          return Promise.resolve(null);
        }),
      },
      bimModel: {
        create: jest.fn().mockImplementation(({ data }) => {
          const newModel = {
            id: `model-${Math.floor(Math.random() * 1000)}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          };
          bimModelsDb.push(newModel);
          return Promise.resolve(newModel);
        }),
        findFirst: jest.fn().mockImplementation(({ where, orderBy }) => {
          let match = bimModelsDb.find(
            m => m.projectId === where.projectId && m.name.toLowerCase() === where.name?.equals?.toLowerCase() && m.deletedAt === null
          );
          return Promise.resolve(match || null);
        }),
        findMany: jest.fn().mockImplementation(({ where, skip, take }) => {
          let list = [...bimModelsDb];
          if (where?.deletedAt === null) {
            list = list.filter(m => m.deletedAt === null);
          }
          if (where?.projectId) {
            list = list.filter(m => m.projectId === where.projectId);
          }
          if (where?.fileType) {
            list = list.filter(m => m.fileType === where.fileType);
          }
          const pageList = list.slice(skip || 0, (skip || 0) + (take || 10));
          return Promise.resolve(pageList);
        }),
        count: jest.fn().mockImplementation(({ where }) => {
          let list = [...bimModelsDb];
          if (where?.deletedAt === null) {
            list = list.filter(m => m.deletedAt === null);
          }
          return Promise.resolve(list.length);
        }),
        update: jest.fn().mockImplementation(({ where, data }) => {
          const index = bimModelsDb.findIndex(m => m.id === where.id);
          if (index === -1) return Promise.resolve(null);
          const updated = {
            ...bimModelsDb[index],
            ...data,
            updatedAt: new Date(),
          };
          bimModelsDb[index] = updated;
          return Promise.resolve(updated);
        }),
      },
      bimElement: {
        create: jest.fn().mockImplementation(({ data }) => {
          const newEl = {
            id: `el-${Math.floor(Math.random() * 1000)}`,
            ...data,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          bimElementsDb.push(newEl);
          return Promise.resolve(newEl);
        }),
        findMany: jest.fn().mockImplementation(({ where }) => {
          return Promise.resolve(bimElementsDb.filter(el => el.modelId === where.modelId));
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
      imports: [BimModule],
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

  describe('POST /bim', () => {
    it('should successfully upload and register a new BIM Model with extracted elements', async () => {
      const payload = {
        name: 'Block A Structural', // conflicts name => auto increments version to 2
        fileUrl: 'https://storage.buildtrace.in/models/bld-111_v2.ifc',
        fileType: 'IFC',
        projectId: 'proj-111',
        description: 'Updated with slab columns revision',
      };

      const res = await request(app.getHttpServer())
        .post('/bim')
        .send(payload)
        .expect(HttpStatus.CREATED);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Block A Structural');
      expect(res.body.version).toBe(2); // Auto-version incremented
      expect(res.body.status).toBe('COMPLETED');
    });

    it('should reject upload if file extension mismatches fileType', async () => {
      const payload = {
        name: 'Plumbing Layout',
        fileUrl: 'https://storage.buildtrace.in/models/plumb.rvt', // RVT extension
        fileType: 'IFC', // but fileType IFC
        projectId: 'proj-111',
      };

      await request(app.getHttpServer())
        .post('/bim')
        .send(payload)
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should reject upload if project does not exist', async () => {
      const payload = {
        name: 'Block B Structural',
        fileUrl: 'https://storage.buildtrace.in/models/block_b.ifc',
        fileType: 'IFC',
        projectId: 'proj-missing-999',
      };

      await request(app.getHttpServer())
        .post('/bim')
        .send(payload)
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('GET /bim', () => {
    it('should retrieve list of all models', async () => {
      const res = await request(app.getHttpServer())
        .get('/bim')
        .expect(HttpStatus.OK);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('POST /bim/:id/align', () => {
    it('should update coordinate alignments on model', async () => {
      const alignmentPayload = {
        coordinateSystem: {
          crs: 'EPSG:32643',
          origin: [432000, 1438000, 100],
          scale: 1.0,
        },
      };

      const res = await request(app.getHttpServer())
        .post('/bim/model-111/align')
        .send(alignmentPayload)
        .expect(HttpStatus.OK);

      expect(res.body.coordinateSystem.crs).toBe('EPSG:32643');
      expect(res.body.coordinateSystem.origin).toEqual([432000, 1438000, 100]);
    });
  });

  describe('POST /bim/compare', () => {
    it('should calculate structural deviations between version 1 and newly uploaded model', async () => {
      // Find the second model created earlier
      const v2Model = bimModelsDb.find(m => m.version === 2);
      expect(v2Model).toBeDefined();

      const comparePayload = {
        sourceModelId: 'model-111',
        targetModelId: v2Model.id,
      };

      const res = await request(app.getHttpServer())
        .post('/bim/compare')
        .send(comparePayload)
        .expect(HttpStatus.OK);

      expect(res.body).toHaveProperty('comparisonSummary');
      expect(res.body.comparisonSummary).toHaveProperty('addedCount');
      expect(res.body.comparisonSummary).toHaveProperty('deletedCount');
    });
  });
});
