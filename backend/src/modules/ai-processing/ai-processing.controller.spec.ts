import { Test, TestingModule } from '@nestjs/testing';
import { AiProcessingController } from './ai-processing.controller';
import { AiProcessingService } from './ai-processing.service';
import { CreateAiJobDto } from './dto/create-ai-job.dto';
import { QueryAiJobDto } from './dto/query-ai-job.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { ExecutionContext } from '@nestjs/common';

describe('AiProcessingController Unit Tests', () => {
  let controller: AiProcessingController;
  let service: AiProcessingService;

  const mockAiJob = {
    id: 'job-123',
    jobType: 'FRAME_EXTRACTION',
    status: 'PENDING',
    priority: 0,
    projectId: 'proj-123',
    videoId: 'vid-123',
    retryCount: 0,
    maxRetries: 3,
    gpuRequired: false,
    progressPercent: 0,
    processingLogs: ['[INFO] Init'],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMetrics = {
    pendingCount: 1,
    processingCount: 0,
    completedCount: 10,
    failedCount: 2,
    activeGpuUtilization: 0,
    activeGpuMemoryMb: 0,
    averageProcessingTimeSeconds: 245,
  };

  beforeEach(async () => {
    const mockAiProcessingService = {
      createJob: jest.fn().mockResolvedValue(mockAiJob),
      listJobs: jest.fn().mockResolvedValue({ data: [mockAiJob], total: 1, page: 1, limit: 10, totalPages: 1 }),
      getJobById: jest.fn().mockResolvedValue(mockAiJob),
      retryJob: jest.fn().mockResolvedValue({ ...mockAiJob, status: 'PENDING', retryCount: 1 }),
      getJobLogs: jest.fn().mockResolvedValue({ jobId: 'job-123', jobType: 'FRAME_EXTRACTION', status: 'PENDING', logs: ['[INFO] Init'] }),
      getQueueMetrics: jest.fn().mockResolvedValue(mockMetrics),
    };

    const mockAuthGuard = {
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: 'user-id-123', email: 'test@buildtrace.in', role: 'admin' };
        return true;
      },
    };

    const mockPermissionsGuard = {
      canActivate: () => true,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiProcessingController],
      providers: [
        { provide: AiProcessingService, useValue: mockAiProcessingService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(PermissionsGuard)
      .useValue(mockPermissionsGuard)
      .compile();

    controller = module.get<AiProcessingController>(AiProcessingController);
    service = module.get<AiProcessingService>(AiProcessingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should invoke aiService.createJob with dto and user context', async () => {
      const dto: CreateAiJobDto = {
        jobType: 'FRAME_EXTRACTION',
        projectId: 'proj-123',
        videoId: 'vid-123',
      };
      const req = { user: { id: 'user-id-123' } };

      const result = await controller.create(dto, req);
      expect(service.createJob).toHaveBeenCalledWith(dto, 'user-id-123');
      expect(result).toEqual(mockAiJob);
    });
  });

  describe('findAll', () => {
    it('should list background jobs matching query parameters', async () => {
      const query: QueryAiJobDto = { projectId: 'proj-123', status: 'PENDING', page: 1, limit: 10 };
      const result = await controller.findAll(query);
      expect(service.listJobs).toHaveBeenCalledWith(query);
      expect(result.data).toContainEqual(mockAiJob);
    });
  });

  describe('findOne', () => {
    it('should fetch single AI job details', async () => {
      const result = await controller.findOne('job-123');
      expect(service.getJobById).toHaveBeenCalledWith('job-123');
      expect(result).toEqual(mockAiJob);
    });
  });

  describe('retry', () => {
    it('should invoke manual retry handler', async () => {
      const req = { user: { id: 'user-id-123' } };
      const result = await controller.retry('job-123', req);
      expect(service.retryJob).toHaveBeenCalledWith('job-123', 'user-id-123');
      expect(result.status).toEqual('PENDING');
      expect(result.retryCount).toEqual(1);
    });
  });

  describe('getLogs', () => {
    it('should fetch execution log rows', async () => {
      const result = await controller.getLogs('job-123');
      expect(service.getJobLogs).toHaveBeenCalledWith('job-123');
      expect(result.logs).toContain('[INFO] Init');
    });
  });

  describe('getMetrics', () => {
    it('should return aggregated queue and GPU metrics', async () => {
      const result = await controller.getMetrics('proj-123');
      expect(service.getQueueMetrics).toHaveBeenCalledWith('proj-123');
      expect(result).toEqual(mockMetrics);
    });
  });
});
