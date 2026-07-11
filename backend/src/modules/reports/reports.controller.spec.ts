import { Test, TestingModule } from '@nestjs/testing';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { CreateReportDto, ReportType, ReportFormat } from './dto/create-report.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('ReportsController Unit Tests', () => {
  let controller: ReportsController;
  let service: ReportsService;

  const mockReport = {
    id: 'report-123',
    projectId: 'proj-123',
    name: 'Weekly Site Performance',
    type: 'WEEKLY',
    format: 'PDF',
    status: 'READY',
    filePath: '/downloads/reports/proj-123-weekly.pdf',
    summary: 'Mock Summary',
    reportData: {},
  };

  beforeEach(async () => {
    const mockReportsService = {
      createReport: jest.fn().mockResolvedValue(mockReport),
      getReports: jest.fn().mockResolvedValue({ items: [mockReport], total: 1 }),
      getReportById: jest.fn().mockResolvedValue(mockReport),
      generateFileBuffer: jest.fn().mockResolvedValue({
        buffer: Buffer.from('Mock PDF Content', 'utf-8'),
        filename: 'Weekly_Site_Performance.pdf',
        contentType: 'application/pdf',
      }),
      deleteReport: jest.fn().mockResolvedValue({ success: true }),
    };

    const mockPrismaService = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportsController],
      providers: [
        { provide: ReportsService, useValue: mockReportsService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ReportsController>(ReportsController);
    service = module.get<ReportsService>(ReportsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createReport', () => {
    it('should invoke createReport with DTO and userId', async () => {
      const dto: CreateReportDto = {
        projectId: 'proj-123',
        name: 'Weekly Site Performance',
        type: ReportType.WEEKLY,
        format: ReportFormat.PDF,
      };

      const result = await controller.createReport(dto, { headers: { 'x-user-id': 'user-1' } });
      expect(result).toEqual(mockReport);
      expect(service.createReport).toHaveBeenCalledWith(dto, 'user-1');
    });
  });

  describe('getReports', () => {
    it('should fetch and return a paginated report batch', async () => {
      const result = await controller.getReports({ page: 1, limit: 10 });
      expect(result.items).toContainEqual(mockReport);
      expect(service.getReports).toHaveBeenCalled();
    });
  });

  describe('getReportById', () => {
    it('should query details for a specific report UUID', async () => {
      const result = await controller.getReportById('report-123');
      expect(result).toEqual(mockReport);
      expect(service.getReportById).toHaveBeenCalledWith('report-123');
    });
  });

  describe('deleteReport', () => {
    it('should delete and audit purge logs', async () => {
      const result = await controller.deleteReport('report-123', { headers: { 'x-user-id': 'user-1' } });
      expect(result).toEqual({ success: true });
      expect(service.deleteReport).toHaveBeenCalledWith('report-123', 'user-1');
    });
  });
});
