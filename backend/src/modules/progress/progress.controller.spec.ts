import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { CreateProgressDto, CreateSnapshotDto } from './dto/create-progress.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('ProgressController Unit Tests', () => {
  let controller: ProgressController;
  let service: ProgressService;

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
  };

  const mockSnapshot = {
    id: 'snap-123',
    projectId: 'proj-123',
    buildingId: 'bldg-123',
    completedPercent: 50.0,
    plannedPercent: 65.0,
    laborHoursUsed: 120,
    paceWeeklyDelta: 4.5,
    capturedAt: new Date(),
  };

  const mockAggregated = {
    actualProgress: 50.0,
    plannedProgress: 65.0,
    progressPercent: 76.9,
    completionPercent: 50.0,
    remainingWork: 75.0,
    totalQuantity: 100,
    installedQuantity: 50,
    laborHoursPaid: 120,
    trades: {
      Structural: { completionPercent: 50.0, remainingWorkPoints: 75.0 },
    },
  };

  beforeEach(async () => {
    const mockProgressService = {
      createProgressRecord: jest.fn().mockResolvedValue(mockProgressRecord),
      updateProgressRecord: jest.fn().mockResolvedValue({ ...mockProgressRecord, installedQuantity: 70.0 }),
      getProgressRecordById: jest.fn().mockResolvedValue(mockProgressRecord),
      getProgressRecords: jest.fn().mockResolvedValue({ items: [mockProgressRecord], total: 1 }),
      getProjectSnapshots: jest.fn().mockResolvedValue([mockSnapshot]),
      createSnapshotManual: jest.fn().mockResolvedValue(mockSnapshot),
      getAggregatedProgress: jest.fn().mockResolvedValue(mockAggregated),
    };

    const mockPrismaService = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgressController],
      providers: [
        { provide: ProgressService, useValue: mockProgressService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProgressController>(ProgressController);
    service = module.get<ProgressService>(ProgressService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProgressRecord', () => {
    it('should create and return a progress record', async () => {
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

      const result = await controller.createProgressRecord(dto, { headers: { 'x-user-id': 'user-1' } });
      expect(result).toEqual(mockProgressRecord);
      expect(service.createProgressRecord).toHaveBeenCalledWith(dto, 'user-1');
    });
  });

  describe('updateProgressRecord', () => {
    it('should update and return the progress record', async () => {
      const dto = { installedQuantity: 70.0 };
      const result = await controller.updateProgressRecord('record-123', dto, { headers: { 'x-user-id': 'user-1' } });
      expect(result.installedQuantity).toEqual(70.0);
      expect(service.updateProgressRecord).toHaveBeenCalledWith('record-123', dto, 'user-1');
    });
  });

  describe('getProjectSnapshots', () => {
    it('should return chronological snapshots for S-curves', async () => {
      const result = await controller.getProjectSnapshots('proj-123', 'bldg-123');
      expect(result).toEqual([mockSnapshot]);
      expect(service.getProjectSnapshots).toHaveBeenCalledWith('proj-123', 'bldg-123');
    });
  });

  describe('getAggregatedProgress', () => {
    it('should return aggregated spatial progress calculations', async () => {
      const result = await controller.getAggregatedProgress('proj-123', 'bldg-123', 'floor-123', 'room-123');
      expect(result).toEqual(mockAggregated);
      expect(service.getAggregatedProgress).toHaveBeenCalledWith('proj-123', 'bldg-123', 'floor-123', 'room-123');
    });
  });
});
