import { Test, TestingModule } from '@nestjs/testing';
import { AiProcessingService } from './ai-processing.service';
import { AiProcessingRepository } from './ai-processing.repository';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('AiProcessingService Unit Tests', () => {
  let service: AiProcessingService;
  let repo: AiProcessingRepository;
  let prisma: PrismaService;
  let audit: AuditService;

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

  const mockProject = {
    id: 'proj-123',
    name: 'Project Bengaluru',
    organizationId: 'org-abc',
  };

  const mockVideo = {
    id: 'vid-123',
    name: 'Survey 1',
  };

  beforeEach(async () => {
    const mockAiProcessingRepository = {
      createJob: jest.fn().mockResolvedValue(mockAiJob),
      findJobById: jest.fn().mockResolvedValue(mockAiJob),
      findJobs: jest.fn().mockResolvedValue({ data: [mockAiJob], total: 1 }),
      updateJob: jest.fn().mockResolvedValue(mockAiJob),
      getQueueMetrics: jest.fn().mockResolvedValue({ pendingCount: 1 }),
    };

    const mockAuditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const mockPrismaService = {
      project: {
        findUnique: jest.fn().mockResolvedValue(mockProject),
      },
      video: {
        findUnique: jest.fn().mockResolvedValue(mockVideo),
      },
      aiJob: {
        findUnique: jest.fn().mockResolvedValue(mockAiJob),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiProcessingService,
        { provide: AiProcessingRepository, useValue: mockAiProcessingRepository },
        { provide: AuditService, useValue: mockAuditService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AiProcessingService>(AiProcessingService);
    repo = module.get<AiProcessingRepository>(AiProcessingRepository);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createJob', () => {
    it('should successfully schedule and save a job if project and video exists', async () => {
      const dto = {
        jobType: 'FRAME_EXTRACTION',
        projectId: 'proj-123',
        videoId: 'vid-123',
      };

      const result = await service.createJob(dto, 'user-abc');
      expect(prisma.project.findUnique).toHaveBeenCalled();
      expect(prisma.video.findUnique).toHaveBeenCalled();
      expect(repo.createJob).toHaveBeenCalledWith(dto);
      expect(audit.log).toHaveBeenCalled();
      expect(result).toEqual(mockAiJob);
    });

    it('should throw NotFoundException if project is missing', async () => {
      jest.spyOn(prisma.project, 'findUnique').mockResolvedValueOnce(null);
      const dto = { jobType: 'FRAME_EXTRACTION', projectId: 'invalid' };

      await expect(service.createJob(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getJobById', () => {
    it('should return a job matching ID', async () => {
      const result = await service.getJobById('job-123');
      expect(repo.findJobById).toHaveBeenCalledWith('job-123');
      expect(result).toEqual(mockAiJob);
    });

    it('should throw NotFoundException if job is not found', async () => {
      jest.spyOn(repo, 'findJobById').mockResolvedValueOnce(null);
      await expect(service.getJobById('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('retryJob', () => {
    it('should allow retrying of failed jobs', async () => {
      jest.spyOn(repo, 'findJobById').mockResolvedValueOnce({
        ...mockAiJob,
        status: 'FAILED',
        project: mockProject,
      } as any);

      jest.spyOn(repo, 'updateJob').mockResolvedValueOnce({
        ...mockAiJob,
        status: 'PENDING',
        retryCount: 1,
      } as any);

      const result = await service.retryJob('job-123', 'user-abc');
      expect(result.status).toEqual('PENDING');
      expect(result.retryCount).toEqual(1);
    });

    it('should forbid retrying of already pending or completed jobs', async () => {
      await expect(service.retryJob('job-123')).rejects.toThrow(BadRequestException);
    });
  });
});
