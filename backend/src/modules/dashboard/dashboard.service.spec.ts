import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';

describe('DashboardService', () => {
  let service: DashboardService;
  let repo: any;

  beforeEach(async () => {
    const mockRepo = {
      getOrganizationProjectsSummary: jest.fn().mockResolvedValue([]),
      getProjectHealthMetrics: jest.fn().mockResolvedValue({
        project: null,
        milestones: [],
        snapshots: [],
        progressRecords: [],
      }),
      getProgressSnapshots: jest.fn().mockResolvedValue([]),
      getProgressRecords: jest.fn().mockResolvedValue([]),
      getRecentActivities: jest.fn().mockResolvedValue({
        aiJobs: [],
        reports: [],
        logs: [],
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: DashboardRepository, useValue: mockRepo },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
    repo = module.get<DashboardRepository>(DashboardRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should fall back to simulated dashboard summaries if empty database', async () => {
    const res = await service.getOrganizationSummary('org-123');
    expect(res.activeProjects).toEqual(4);
    expect(res.projectSummaries.length).toBeGreaterThan(0);
  });

  it('should fall back to simulated health telemetry if no project exists', async () => {
    const res = await service.getProjectHealth('proj-123');
    expect(res.overallHealth).toEqual('At Risk');
    expect(res.healthScore).toEqual(78);
  });
});
