import { Test, TestingModule } from '@nestjs/testing';
import { BimService } from './bim.service';
import { BimRepository } from './bim.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('BimService Unit Tests', () => {
  let service: BimService;
  let repo: BimRepository;
  let prisma: PrismaService;
  let audit: AuditService;

  const mockProject = { id: 'proj-111', name: 'Tech Hub', organizationId: 'org-111' };

  const mockModel = {
    id: 'model-111',
    name: 'Block A',
    description: 'Structural',
    fileUrl: 'https://storage.buildtrace.in/models/bld-111_struc_v1.ifc',
    fileType: 'IFC',
    version: 1,
    status: 'COMPLETED',
    coordinateSystem: { crs: 'EPSG:3857', origin: [0, 0, 0] },
    metadata: {},
    projectId: 'proj-111',
    project: mockProject,
  };

  const mockElements = [
    {
      id: 'el-1',
      externalId: 'IFC-WALL-001',
      name: 'Standard Wall 1',
      type: 'IFCWALL',
      category: 'Structural',
      geometry: { min: [0, 0, 0], max: [1, 1, 1] },
      properties: { Volume: '1.0 cum', Area: '1.0 sqm' },
      modelId: 'model-111',
    },
  ];

  beforeEach(async () => {
    const mockBimRepository = {
      createModel: jest.fn().mockResolvedValue(mockModel),
      findModelById: jest.fn().mockImplementation((id, includeElements) => {
        if (id === 'model-111') {
          return Promise.resolve({
            ...mockModel,
            elements: includeElements ? mockElements : [],
          });
        }
        return Promise.resolve(null);
      }),
      findLatestVersion: jest.fn().mockResolvedValue(null), // returns null => starts at v1
      updateModel: jest.fn().mockImplementation((id, data) => Promise.resolve({ ...mockModel, ...data })),
      findAllModels: jest.fn().mockResolvedValue({ items: [mockModel], totalItems: 1 }),
      softDeleteModel: jest.fn().mockResolvedValue({ ...mockModel, deletedAt: new Date() }),
      restoreModel: jest.fn().mockResolvedValue({ ...mockModel, deletedAt: null }),
      createElements: jest.fn().mockResolvedValue(mockElements),
      findElementsByModel: jest.fn().mockImplementation((modelId) => {
        if (modelId === 'model-111') return Promise.resolve(mockElements);
        if (modelId === 'model-222') {
          return Promise.resolve([
            {
              id: 'el-1',
              externalId: 'IFC-WALL-001',
              name: 'Standard Wall 1',
              type: 'IFCWALL',
              category: 'Structural',
              geometry: { min: [0, 0, 0], max: [1, 1, 1] },
              properties: { Volume: '1.2 cum', Area: '1.0 sqm' }, // Modified volume
              modelId: 'model-222',
            },
            {
              id: 'el-2',
              externalId: 'IFC-COLUMN-002',
              name: 'Support Column 1',
              type: 'IFCCOLUMN',
              category: 'Structural',
              geometry: { min: [5, 5, 0], max: [6, 6, 3] },
              properties: { Volume: '3.0 cum' },
              modelId: 'model-222',
            },
          ]);
        }
        return Promise.resolve([]);
      }),
    };

    const mockPrismaService = {
      project: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'proj-111') return Promise.resolve(mockProject);
          return Promise.resolve(null);
        }),
      },
    };

    const mockAuditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BimService,
        { provide: BimRepository, useValue: mockBimRepository },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<BimService>(BimService);
    repo = module.get<BimRepository>(BimRepository);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createModel', () => {
    it('should validate extension and create model with version 1', async () => {
      const dto = {
        name: 'Block A',
        fileUrl: 'https://storage.buildtrace.in/models/bld_1.ifc',
        fileType: 'IFC',
        projectId: 'proj-111',
      };

      const result = await service.createModel(dto, 'user-id-123');
      expect(prisma.project.findFirst).toHaveBeenCalled();
      expect(repo.createModel).toHaveBeenCalledWith(dto, 1);
      expect(repo.createElements).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalled();
      expect(result.status).toBe('COMPLETED');
    });

    it('should throw NotFoundException if project does not exist', async () => {
      const dto = {
        name: 'Block A',
        fileUrl: 'https://storage.buildtrace.in/models/bld_1.ifc',
        fileType: 'IFC',
        projectId: 'proj-missing-999',
      };

      await expect(service.createModel(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if extension mismatches fileType', async () => {
      const dto = {
        name: 'Block A',
        fileUrl: 'https://storage.buildtrace.in/models/bld_1.rvt', // RVT extension but type IFC
        fileType: 'IFC',
        projectId: 'proj-111',
      };

      await expect(service.createModel(dto)).rejects.toThrow(BadRequestException);
    });

    it('should auto-increment version if model name already exists', async () => {
      jest.spyOn(repo, 'findLatestVersion').mockResolvedValueOnce({ ...mockModel, version: 3 } as any);

      const dto = {
        name: 'Block A',
        fileUrl: 'https://storage.buildtrace.in/models/bld_1.ifc',
        fileType: 'IFC',
        projectId: 'proj-111',
      };

      await service.createModel(dto);
      expect(repo.createModel).toHaveBeenCalledWith(dto, 4); // Incremented from 3 to 4
    });
  });

  describe('alignCoordinates', () => {
    it('should update the coordinate alignment JSON', async () => {
      const coords = { crs: 'EPSG:32643', origin: [432100.5, 1438900.2, 50.0] };
      const result = await service.alignCoordinates('model-111', coords, 'user-123');

      expect(repo.updateModel).toHaveBeenCalledWith('model-111', { coordinateSystem: coords });
      expect(result.coordinateSystem).toEqual(coords);
    });

    it('should reject alignment if critical properties are omitted', async () => {
      await expect(service.alignCoordinates('model-111', { origin: [0, 0, 0] })).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('compareModels', () => {
    it('should identify elements as added, deleted, or modified', async () => {
      jest.spyOn(repo, 'findModelById').mockImplementation((id) => {
        if (id === 'model-111') return Promise.resolve(mockModel as any);
        if (id === 'model-222') return Promise.resolve({ ...mockModel, id: 'model-222' } as any);
        return Promise.resolve(null);
      });

      const result = await service.compareModels({
        sourceModelId: 'model-111',
        targetModelId: 'model-222',
      });

      // From model-111 (source: el-1) to model-222 (target: el-1 [modified volume], el-2 [added])
      expect(result.comparisonSummary.addedCount).toBe(1); // el-2 added
      expect(result.comparisonSummary.deletedCount).toBe(0); // none deleted
      expect(result.comparisonSummary.modifiedCount).toBe(1); // el-1 volume changed from 1.0 to 1.2
      expect(result.comparisonSummary.unchangedCount).toBe(0);

      expect(result.added[0].externalId).toBe('IFC-COLUMN-002');
      expect(result.modified[0].externalId).toBe('IFC-WALL-001');
    });
  });
});
