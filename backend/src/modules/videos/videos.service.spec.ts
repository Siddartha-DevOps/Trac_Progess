import { Test, TestingModule } from '@nestjs/testing';
import { VideosService } from './videos.service';
import { VideosRepository } from './videos.repository';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('VideosService Unit Tests', () => {
  let service: VideosService;
  let repo: VideosRepository;
  let prisma: PrismaService;
  let audit: AuditService;

  const mockProject = { id: 'proj-123', name: 'Tower A construction', organizationId: 'org-456' };
  const mockVideo = {
    id: 'vid-abc',
    name: 'Drone Scan 1',
    description: 'Structural inspection video',
    fileSize: 10485760, // 10MB
    mimeType: 'video/mp4',
    is360: false,
    status: 'UPLOADING',
    compressionStatus: 'PENDING',
    projectId: 'proj-123',
    uploadedById: 'usr-888',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockSession = {
    id: 'sess-abc',
    uploadToken: 'tok_abc123',
    fileName: 'Drone Scan 1.mp4',
    fileSize: 10485760,
    chunkSize: 5242880,
    totalChunks: 2,
    uploadedChunks: [],
    status: 'INITIALIZED',
    projectId: 'proj-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockVideosRepository = {
      createVideo: jest.fn().mockResolvedValue(mockVideo),
      createUploadSession: jest.fn().mockResolvedValue(mockSession),
      findSessionByToken: jest.fn().mockImplementation((token) => {
        if (token === 'tok_abc123') return Promise.resolve(mockSession);
        return Promise.resolve(null);
      }),
      updateUploadSession: jest.fn().mockImplementation((id, status, uploadedChunks) => {
        return Promise.resolve({ ...mockSession, status, uploadedChunks });
      }),
      findVideoById: jest.fn().mockImplementation((id, includeDeleted) => {
        if (id === 'vid-abc') {
          return Promise.resolve({
            ...mockVideo,
            project: mockProject,
          });
        }
        return Promise.resolve(null);
      }),
      updateVideo: jest.fn().mockResolvedValue({ ...mockVideo, name: 'Updated Drone Scan' }),
      updateVideoStorageDetails: jest.fn().mockResolvedValue(undefined),
      findAllVideos: jest.fn().mockResolvedValue({ items: [mockVideo], totalItems: 1 }),
      softDeleteVideo: jest.fn().mockResolvedValue({ ...mockVideo, deletedAt: new Date() }),
      restoreVideo: jest.fn().mockResolvedValue({ ...mockVideo, deletedAt: null }),
    };

    const mockAuditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const mockPrismaService = {
      project: {
        findFirst: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'proj-123') {
            return Promise.resolve(mockProject);
          }
          return Promise.resolve(null);
        }),
      },
      video: {
        findMany: jest.fn().mockResolvedValue([mockVideo]),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VideosService,
        { provide: VideosRepository, useValue: mockVideosRepository },
        { provide: AuditService, useValue: mockAuditService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<VideosService>(VideosService);
    repo = module.get<VideosRepository>(VideosRepository);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('initUploadSession', () => {
    it('should initialize a video upload session successfully', async () => {
      const dto = {
        name: 'Drone Scan 1',
        description: 'Structural inspection video',
        fileSize: 10485760,
        mimeType: 'video/mp4',
        projectId: 'proj-123',
        is360: false,
      };

      const result = await service.initUploadSession(dto, 'usr-888');

      expect(result).toBeDefined();
      expect(result.videoId).toBe('vid-abc');
      expect(result.totalChunks).toBe(2);
      expect(audit.log).toHaveBeenCalled();
    });

    it('should throw NotFoundException if project does not exist', async () => {
      const dto = {
        name: 'Drone Scan 1',
        fileSize: 10485760,
        mimeType: 'video/mp4',
        projectId: 'proj-invalid',
      };

      await expect(service.initUploadSession(dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if MIME type is unsupported', async () => {
      const dto = {
        name: 'Drone Scan 1',
        fileSize: 10485760,
        mimeType: 'image/jpeg',
        projectId: 'proj-123',
      };

      await expect(service.initUploadSession(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('uploadChunk', () => {
    it('should upload a chunk successfully', async () => {
      const buffer = Buffer.from('test binary chunk');
      const result = await service.uploadChunk('tok_abc123', 0, 2, buffer, 'usr-888');

      expect(result).toBeDefined();
      expect(result.uploadToken).toBe('tok_abc123');
      expect(result.uploadedChunks).toContain(0);
      expect(result.status).toBe('UPLOADING');
    });

    it('should throw NotFoundException for invalid token', async () => {
      await expect(
        service.uploadChunk('tok_invalid', 0, 2, Buffer.from('')),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for out of bounds chunk index', async () => {
      await expect(
        service.uploadChunk('tok_abc123', 5, 2, Buffer.from('')),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getSessionStatus', () => {
    it('should return session and progress stats', async () => {
      const result = await service.getSessionStatus('tok_abc123');

      expect(result).toBeDefined();
      expect(result.uploadToken).toBe('tok_abc123');
      expect(result.progressPercent).toBe(0);
    });
  });

  describe('findVideoById', () => {
    it('should find active video', async () => {
      const result = await service.findVideoById('vid-abc');
      expect(result).toBeDefined();
      expect(result.id).toBe('vid-abc');
    });
  });
});
