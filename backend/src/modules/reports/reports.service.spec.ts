import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { ReportsRepository } from './reports.repository';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReportDto, ReportType, ReportFormat } from './dto/create-report.dto';
import { NotFoundException } from '@nestjs/common';

describe('ReportsService Unit Tests', () => {
  let service: ReportsService;
  let repo: ReportsRepository;
  let audit: AuditService;
  let prisma: PrismaService;

  const mockProject = {
    id: 'proj-123',
    name: 'Bangalore Tech Park',
    organizationId: 'org-123',
    organization: {
      name: 'BuildTrace Developers Ltd',
    },
  };

  const mockProgressRecord = {
    id: 'rec-123',
    projectId: 'proj-123',
    trade: 'Structural',
    itemName: 'Columns Concrete',
    installedQuantity: 75.0,
    totalQuantity: 100.0,
    unit: 'm³',
    unitWeight: 2.0,
    laborHoursPaid: 150,
    status: 'UNDER_CONSTRUCTION',
  };

  const mockReportRecord = {
    id: 'report-123',
    projectId: 'proj-123',
    name: 'Q3 Structural Audit',
    type: 'PROGRESS',
    format: 'PDF',
    status: 'READY',
    filePath: '/downloads/reports/proj-123-progress.pdf',
    summary: 'Mock Summary',
    reportData: {},
    project: mockProject,
  };

  beforeEach(async () => {
    const mockReportsRepository = {
      createReport: jest.fn().mockResolvedValue(mockReportRecord),
      findReportById: jest.fn().mockResolvedValue(mockReportRecord),
      findReports: jest.fn().mockResolvedValue({ items: [mockReportRecord], total: 1 }),
      deleteReport: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockAuditService = {
      log: jest.fn().mockResolvedValue({ id: 'audit-123' }),
    };

    const mockPrismaService = {
      project: {
        findUnique: jest.fn().mockResolvedValue(mockProject),
      },
      progressRecord: {
        findMany: jest.fn().mockResolvedValue([mockProgressRecord]),
      },
      progressSnapshot: {
        findMany: jest.fn().mockResolvedValue([]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: ReportsRepository, useValue: mockReportsRepository },
        { provide: AuditService, useValue: mockAuditService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);
    repo = module.get<ReportsRepository>(ReportsRepository);
    audit = module.get<AuditService>(AuditService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createReport', () => {
    it('should successfully compile project audit records and save the Report entity', async () => {
      const dto: CreateReportDto = {
        projectId: 'proj-123',
        name: 'Q3 Structural Audit',
        type: ReportType.PROGRESS,
        format: ReportFormat.PDF,
      };

      const result = await service.createReport(dto, 'user-1');

      expect(result).toBeDefined();
      expect(prisma.project.findUnique).toHaveBeenCalledWith({ where: { id: 'proj-123' } });
      expect(prisma.progressRecord.findMany).toHaveBeenCalledWith({ where: { projectId: 'proj-123' } });
      expect(repo.createReport).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'INSERT',
          tableName: 'Report',
          userId: 'user-1',
        }),
      );
    });

    it('should throw NotFoundException if project ID is invalid', async () => {
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(null);

      const dto: CreateReportDto = {
        projectId: 'invalid-id',
        name: 'Invalid Report',
        type: ReportType.DAILY,
        format: ReportFormat.PDF,
      };

      await expect(service.createReport(dto, 'user-1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('generateFileBuffer', () => {
    it('should compile report JSON data into a clean text document representation', async () => {
      const result = await service.generateFileBuffer('report-123');
      expect(result.buffer).toBeDefined();
      expect(result.contentType).toBe('application/pdf');
    });

    it('should throw NotFoundException for non-existent report', async () => {
      jest.spyOn(repo, 'findReportById').mockResolvedValueOnce(null);
      await expect(service.generateFileBuffer('non-existent')).rejects.toThrow(NotFoundException);
    });
  });
});
