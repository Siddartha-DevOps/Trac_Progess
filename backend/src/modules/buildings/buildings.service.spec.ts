import { Test, TestingModule } from '@nestjs/testing';
import { BuildingsService } from './buildings.service';
import { BuildingsRepository } from './buildings.repository';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('BuildingsService Unit Tests', () => {
  let service: BuildingsService;
  let repo: BuildingsRepository;
  let prisma: PrismaService;
  let audit: AuditService;

  // Mock structures
  const mockProject = { id: 'project-123', name: 'Bangalore Tech Park', organizationId: 'org-789' };
  const mockBuilding = {
    id: 'bld-abc',
    name: 'Tower A',
    description: 'Residential Wing',
    type: 'RESIDENTIAL',
    status: 'PLANNING',
    floors: 14,
    basementFloors: 2,
    totalArea: 75000.5,
    parkingSpaces: 120,
    metadata: { constructionMethod: 'Precast' },
    address: 'Electronics City',
    city: 'Bangalore',
    state: 'Karnataka',
    postalCode: '560100',
    latitude: 12.8456,
    longitude: 77.6632,
    projectId: 'project-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockBuildingsRepository = {
      createBuilding: jest.fn().mockResolvedValue(mockBuilding),
      updateBuilding: jest.fn().mockResolvedValue({ ...mockBuilding, name: 'Tower A - Main' }),
      findBuildingById: jest.fn().mockImplementation((id, includeDeleted) => {
        if (id === 'bld-abc') {
          return Promise.resolve(mockBuilding);
        }
        return Promise.resolve(null);
      }),
      findBuildingByNameAndProject: jest.fn().mockResolvedValue(null),
      findAllBuildings: jest.fn().mockResolvedValue({ items: [mockBuilding], totalItems: 1 }),
      softDeleteBuilding: jest.fn().mockResolvedValue({ ...mockBuilding, deletedAt: new Date() }),
      restoreBuilding: jest.fn().mockResolvedValue({ ...mockBuilding, deletedAt: null }),
      getProjectBuildingsAnalytics: jest.fn().mockResolvedValue({
        projectId: 'project-123',
        totalBuildings: 1,
        totalFloors: 14,
        totalBasementFloors: 2,
        totalParkingSpaces: 120,
        cumulativeArea: 75000.5,
        statusBreakdown: { planning: 1, underConstruction: 0, completed: 0, commissioned: 0 },
        typeBreakdown: { residential: 1, commercial: 0, industrial: 0, mixedUse: 0, other: 0 },
      }),
    };

    const mockAuditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const mockPrismaService = {
      project: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'project-123') {
            return Promise.resolve(mockProject);
          }
          return Promise.resolve(null);
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BuildingsService,
        { provide: BuildingsRepository, useValue: mockBuildingsRepository },
        { provide: AuditService, useValue: mockAuditService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<BuildingsService>(BuildingsService);
    repo = module.get<BuildingsRepository>(BuildingsRepository);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBuilding', () => {
    const createDto = {
      name: 'Tower A',
      projectId: 'project-123',
    };

    it('should successfully create a building if parent project exists and name is unique', async () => {
      const result = await service.createBuilding(createDto, 'user-999');
      expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: 'project-123' } });
      expect(repo.findBuildingByNameAndProject).toHaveBeenCalledWith('Tower A', 'project-123');
      expect(repo.createBuilding).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'INSERT', tableName: 'Building', recordId: 'bld-abc' }),
      );
      expect(result).toEqual(mockBuilding);
    });

    it('should throw NotFoundException if parent project does not exist', async () => {
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.createBuilding(createDto, 'user-999')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if building name already exists in same project', async () => {
      jest.spyOn(repo, 'findBuildingByNameAndProject').mockResolvedValueOnce(mockBuilding as any);
      await expect(service.createBuilding(createDto, 'user-999')).rejects.toThrow(ConflictException);
    });
  });

  describe('updateBuilding', () => {
    const updateDto = { name: 'Tower A - Main' };

    it('should successfully update structural details of an existing building', async () => {
      const result = await service.updateBuilding('bld-abc', updateDto, 'user-999');
      expect(repo.findBuildingById).toHaveBeenCalledWith('bld-abc');
      expect(repo.updateBuilding).toHaveBeenCalledWith('bld-abc', updateDto);
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE', tableName: 'Building', recordId: 'bld-abc' }),
      );
      expect(result.name).toBe('Tower A - Main');
    });

    it('should throw NotFoundException if building to update is missing', async () => {
      await expect(service.updateBuilding('missing-id', updateDto, 'user-999')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updated name duplicates another building in same project', async () => {
      const conflictBuilding = { ...mockBuilding, id: 'bld-xyz', name: 'Tower B' };
      jest.spyOn(repo, 'findBuildingByNameAndProject').mockResolvedValueOnce(conflictBuilding as any);
      await expect(service.updateBuilding('bld-abc', { name: 'Tower B' }, 'user-999')).rejects.toThrow(ConflictException);
    });
  });

  describe('findBuildingById', () => {
    it('should return building details if building exists', async () => {
      const result = await service.findBuildingById('bld-abc');
      expect(repo.findBuildingById).toHaveBeenCalledWith('bld-abc', false);
      expect(result).toEqual(mockBuilding);
    });

    it('should throw NotFoundException if building ID is unrecognized', async () => {
      await expect(service.findBuildingById('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDeleteBuilding', () => {
    it('should trigger soft-delete with timestamp and log to audit', async () => {
      const result = await service.softDeleteBuilding('bld-abc', 'user-999');
      expect(repo.findBuildingById).toHaveBeenCalledWith('bld-abc');
      expect(repo.softDeleteBuilding).toHaveBeenCalledWith('bld-abc');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', tableName: 'Building', recordId: 'bld-abc' }),
      );
      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('restoreBuilding', () => {
    it('should reset deletedAt to null for soft-deleted building', async () => {
      const deletedBuilding = { ...mockBuilding, deletedAt: new Date() };
      jest.spyOn(repo, 'findBuildingById').mockResolvedValueOnce(deletedBuilding as any);

      const result = await service.restoreBuilding('bld-abc', 'user-999');
      expect(repo.findBuildingById).toHaveBeenCalledWith('bld-abc', true);
      expect(repo.restoreBuilding).toHaveBeenCalledWith('bld-abc');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'RESTORE', tableName: 'Building', recordId: 'bld-abc' }),
      );
      expect(result.deletedAt).toBeNull();
    });
  });

  describe('analytics calculations', () => {
    it('should retrieve compiled analytics if parent project exists', async () => {
      const result = await service.getProjectBuildingsAnalytics('project-123');
      expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: 'project-123' } });
      expect(repo.getProjectBuildingsAnalytics).toHaveBeenCalledWith('project-123');
      expect(result.totalBuildings).toBe(1);
      expect(result.cumulativeArea).toBe(75000.5);
    });

    it('should throw NotFoundException if requesting metrics for missing project', async () => {
      await expect(service.getProjectBuildingsAnalytics('missing-proj')).rejects.toThrow(NotFoundException);
    });
  });
});
