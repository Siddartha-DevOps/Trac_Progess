import { Test, TestingModule } from '@nestjs/testing';
import { FloorsService } from './floors.service';
import { FloorsRepository } from './floors.repository';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('FloorsService Unit Tests', () => {
  let service: FloorsService;
  let repo: FloorsRepository;
  let prisma: PrismaService;
  let audit: AuditService;

  const mockBuilding = { id: 'bld-123', name: 'Tower A', projectId: 'project-123' };
  const mockProject = { id: 'project-123', name: 'Tech Hub', organizationId: 'org-456' };
  const mockFloor = {
    id: 'floor-abc',
    name: 'Ground Floor',
    description: 'Ground level reception',
    number: 0,
    order: 0,
    totalArea: 5000.0,
    status: 'PLANNING',
    metadata: { key: 'value' },
    buildingId: 'bld-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockFloorsRepository = {
      createFloor: jest.fn().mockResolvedValue(mockFloor),
      updateFloor: jest.fn().mockResolvedValue({ ...mockFloor, name: 'Ground Floor Lobby' }),
      findFloorById: jest.fn().mockImplementation((id, includeDeleted) => {
        if (id === 'floor-abc') {
          return Promise.resolve({
            ...mockFloor,
            building: {
              ...mockBuilding,
              project: mockProject,
            },
          });
        }
        return Promise.resolve(null);
      }),
      findFloorByLevelNumberAndBuilding: jest.fn().mockResolvedValue(null),
      findFloorByNameAndBuilding: jest.fn().mockResolvedValue(null),
      findAllFloors: jest.fn().mockResolvedValue({ items: [mockFloor], totalItems: 1 }),
      softDeleteFloor: jest.fn().mockResolvedValue({ ...mockFloor, deletedAt: new Date() }),
      restoreFloor: jest.fn().mockResolvedValue({ ...mockFloor, deletedAt: null }),
      updateFloorsOrder: jest.fn().mockResolvedValue([mockFloor]),
    };

    const mockAuditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const mockPrismaService = {
      building: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'bld-123') {
            return Promise.resolve(mockBuilding);
          }
          return Promise.resolve(null);
        }),
      },
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
        FloorsService,
        { provide: FloorsRepository, useValue: mockFloorsRepository },
        { provide: AuditService, useValue: mockAuditService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<FloorsService>(FloorsService);
    repo = module.get<FloorsRepository>(FloorsRepository);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createFloor', () => {
    const createDto = {
      name: 'Ground Floor',
      number: 0,
      order: 0,
      buildingId: 'bld-123',
    };

    it('should successfully create a floor if building exists and attributes are unique', async () => {
      const result = await service.createFloor(createDto, 'user-999');
      expect(prisma.building.findUnique).toHaveBeenCalledWith({ where: { id: 'bld-123' } });
      expect(repo.findFloorByLevelNumberAndBuilding).toHaveBeenCalledWith(0, 'bld-123');
      expect(repo.findFloorByNameAndBuilding).toHaveBeenCalledWith('Ground Floor', 'bld-123');
      expect(repo.createFloor).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'INSERT', tableName: 'Floor', recordId: 'floor-abc' }),
      );
      expect(result).toEqual(mockFloor);
    });

    it('should throw NotFoundException if parent building does not exist', async () => {
      jest.spyOn(prisma.building, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.createFloor(createDto, 'user-999')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if floor level already exists in same building', async () => {
      jest.spyOn(repo, 'findFloorByLevelNumberAndBuilding').mockResolvedValueOnce(mockFloor as any);
      await expect(service.createFloor(createDto, 'user-999')).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException if floor name already exists in same building', async () => {
      jest.spyOn(repo, 'findFloorByNameAndBuilding').mockResolvedValueOnce(mockFloor as any);
      await expect(service.createFloor(createDto, 'user-999')).rejects.toThrow(ConflictException);
    });
  });

  describe('updateFloor', () => {
    const updateDto = { name: 'Ground Floor Lobby' };

    it('should successfully update of an existing floor', async () => {
      const result = await service.updateFloor('floor-abc', updateDto, 'user-999');
      expect(repo.findFloorById).toHaveBeenCalledWith('floor-abc');
      expect(repo.updateFloor).toHaveBeenCalledWith('floor-abc', updateDto);
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE', tableName: 'Floor', recordId: 'floor-abc' }),
      );
      expect(result.name).toBe('Ground Floor Lobby');
    });

    it('should throw NotFoundException if floor to update does not exist', async () => {
      await expect(service.updateFloor('missing-id', updateDto, 'user-999')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updated name duplicates another floor in same building', async () => {
      const conflictFloor = { ...mockFloor, id: 'floor-xyz', name: 'First Floor' };
      jest.spyOn(repo, 'findFloorByNameAndBuilding').mockResolvedValueOnce(conflictFloor as any);
      await expect(service.updateFloor('floor-abc', { name: 'First Floor' }, 'user-999')).rejects.toThrow(ConflictException);
    });
  });

  describe('findFloorById', () => {
    it('should return floor details if floor exists', async () => {
      const result = await service.findFloorById('floor-abc');
      expect(repo.findFloorById).toHaveBeenCalledWith('floor-abc', false);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if floor ID does not exist', async () => {
      await expect(service.findFloorById('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDeleteFloor', () => {
    it('should trigger soft-delete with timestamp and log to audit', async () => {
      const result = await service.softDeleteFloor('floor-abc', 'user-999');
      expect(repo.findFloorById).toHaveBeenCalledWith('floor-abc');
      expect(repo.softDeleteFloor).toHaveBeenCalledWith('floor-abc');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', tableName: 'Floor', recordId: 'floor-abc' }),
      );
      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('restoreFloor', () => {
    it('should reset deletedAt to null for soft-deleted floor', async () => {
      const deletedFloor = {
        ...mockFloor,
        deletedAt: new Date(),
        building: {
          ...mockBuilding,
          project: mockProject,
        },
      };
      jest.spyOn(repo, 'findFloorById').mockResolvedValueOnce(deletedFloor as any);

      const result = await service.restoreFloor('floor-abc', 'user-999');
      expect(repo.findFloorById).toHaveBeenCalledWith('floor-abc', true);
      expect(repo.restoreFloor).toHaveBeenCalledWith('floor-abc');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'RESTORE', tableName: 'Floor', recordId: 'floor-abc' }),
      );
      expect(result.deletedAt).toBeNull();
    });
  });

  describe('reorderFloors', () => {
    it('should bulk reorder floor sorting indices', async () => {
      const result = await service.reorderFloors(['floor-abc'], 'user-999');
      expect(repo.updateFloorsOrder).toHaveBeenCalledWith(['floor-abc']);
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE', tableName: 'Floor' }),
      );
      expect(result).toBeDefined();
    });
  });
});
