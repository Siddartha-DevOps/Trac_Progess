import { Test, TestingModule } from '@nestjs/testing';
import { ProgressService } from './progress.service';
import { ProgressRepository } from './progress.repository';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProgressService Unit Tests', () => {
  let service: ProgressService;
  let repo: ProgressRepository;
  let audit: AuditService;
  let prisma: PrismaService;

  const mockProject = {
    id: 'proj-123',
    name: 'Bangalore Tech Park',
    organizationId: 'org-123',
  };

  const mockProgressRecord = {
    id: 'record-123',
    projectId: 'proj-123',
    buildingId: 'bldg-123',
    trade: 'Structural',
    itemName: 'Concrete Columns',
    installedQuantity: 50.0,
    totalQuantity: 100.0,
    unit: 'm³',
    unitWeight: 1.5,
    status: 'UNDER_CONSTRUCTION',
    project: mockProject,
  };

  beforeEach(async () => {
    const mockProgressRepository = {
      createProgressRecord: jest.fn().mockResolvedValue(mockProgressRecord),
      updateProgressRecord: jest.fn().mockResolvedValue(mockProgressRecord),
      findProgressRecordById: jest.fn().mockResolvedValue(mockProgressRecord),
      findProgressRecords: jest.fn().mockResolvedValue({ items: [mockProgressRecord], total: 1 }),
      createProgressSnapshot: jest.fn().mockResolvedValue({ id: 'snap-123' }),
      getProgressSnapshots: jest.fn().mockResolvedValue([]),
      aggregateProgressByFilter: jest.fn().mockResolvedValue({
        completionPercent: 50.0,
        plannedProgress: 65.0,
        laborHoursPaid: 120,
      }),
    };

    const mockAuditService = {
      log: jest.fn().mockResolvedValue({ id: 'audit-123' }),
    };

    const mockPrismaService = {
      project: {
        findUnique: jest.fn().mockResolvedValue(mockProject),
      },
      building: {
        findUnique: jest.fn().mockResolvedValue({ id: 'bldg-123' }),
      },
      floor: {
        findUnique: jest.fn().mockResolvedValue({ id: 'floor-123' }),
      },
      room: {
        findUnique: jest.fn().mockResolvedValue({ id: 'room-123' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgressService,
        { provide: ProgressRepository, useValue: mockProgressRepository },
        { provide: AuditService, useValue: mockAuditService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProgressService>(ProgressService);
    repo = module.get<ProgressRepository>(ProgressRepository);
    audit = module.get<AuditService>(AuditService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProgressRecord', () => {
    it('should successfully create a progress record and log the RERA audit', async () => {
      const dto: CreateProgressDto = {
        projectId: 'proj-123',
        buildingId: 'bldg-123',
        trade: 'Structural',
        itemName: 'Concrete Columns',
        installedQuantity: 50.0,
        totalQuantity: 100.0,
        unit: 'm³',
        unitWeight: 1.5,
      };

      const result = await service.createProgressRecord(dto, 'user-1');

      expect(result).toBeDefined();
      expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: 'proj-123' } });
      expect(prisma.building.findUnique).toHaveBeenCalledWith({ where: { id: 'bldg-123' } });
      expect(repo.createProgressRecord).toHaveBeenCalledWith(dto);
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'INSERT',
          tableName: 'ProgressRecord',
          userId: 'user-1',
          organizationId: 'org-123',
        }),
      );
    });

    it('should throw NotFoundException if project does not exist', async () => {
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(null);

      const dto: CreateProgressDto = {
        projectId: 'invalid-proj',
        trade: 'Structural',
        itemName: 'Concrete Slabs',
        installedQuantity: 10,
        totalQuantity: 100,
        unit: 'm³',
        unitWeight: 1,
      };

      await expect(service.createProgressRecord(dto, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProgressRecord', () => {
    it('should throw BadRequestException if update quantity is higher than total quantity', async () => {
      const dto = { installedQuantity: 150.0 }; // Total is 100 in mockProgressRecord
      await expect(service.updateProgressRecord('record-123', dto, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should successfully update a record and trigger S-curve snapshots', async () => {
      const dto = { installedQuantity: 80.0 };
      
      const result = await service.updateProgressRecord('record-123', dto, 'user-1');
      
      expect(result).toBeDefined();
      expect(repo.updateProgressRecord).toHaveBeenCalledWith('record-123', dto);
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          tableName: 'ProgressRecord',
          userId: 'user-1',
        }),
      );
    });
  });
});
