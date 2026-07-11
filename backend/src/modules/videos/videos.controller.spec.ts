import { Test, TestingModule } from '@nestjs/testing';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { ExecutionContext } from '@nestjs/common';

describe('VideosController Unit Tests', () => {
  let controller: VideosController;
  let service: VideosService;

  const mockVideo = {
    id: 'vid-abc',
    name: 'Drone Scan 1',
    description: 'Structural inspection video',
    fileSize: 10485760,
    mimeType: 'video/mp4',
    is360: false,
    status: 'COMPLETED',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSessionResponse = {
    videoId: 'vid-abc',
    uploadToken: 'tok_abc123',
    chunkSize: 5242880,
    totalChunks: 2,
    progressPercent: 0,
  };

  beforeEach(async () => {
    const mockVideosService = {
      initUploadSession: jest.fn().mockResolvedValue(mockSessionResponse),
      uploadChunk: jest.fn().mockResolvedValue({
        uploadToken: 'tok_abc123',
        chunkIndex: 0,
        uploadedChunks: [0],
        progressPercent: 50,
        status: 'UPLOADING',
      }),
      getSessionStatus: jest.fn().mockResolvedValue({
        id: 'sess-abc',
        uploadToken: 'tok_abc123',
        fileName: 'Drone Scan 1.mp4',
        fileSize: 10485760,
        chunkSize: 5242880,
        totalChunks: 2,
        uploadedChunks: [0],
        status: 'UPLOADING',
        progressPercent: 50,
      }),
      findVideoById: jest.fn().mockResolvedValue(mockVideo),
      updateVideo: jest.fn().mockResolvedValue({ ...mockVideo, name: 'Updated Name' }),
      findAllVideos: jest.fn().mockResolvedValue({ items: [mockVideo], totalItems: 1 }),
      softDeleteVideo: jest.fn().mockResolvedValue({ ...mockVideo, deletedAt: new Date() }),
      restoreVideo: jest.fn().mockResolvedValue({ ...mockVideo, deletedAt: null }),
    };

    const mockAuthGuard = {
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: 'usr-888', email: 'auditor@buildtrace.in', role: 'auditor' };
        return true;
      },
    };

    const mockPermissionsGuard = {
      canActivate: () => true,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideosController],
      providers: [
        { provide: VideosService, useValue: mockVideosService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(PermissionsGuard)
      .useValue(mockPermissionsGuard)
      .compile();

    controller = module.get<VideosController>(VideosController);
    service = module.get<VideosService>(VideosService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('initUpload', () => {
    it('should initialize an upload session', async () => {
      const dto = {
        name: 'Drone Scan 1',
        description: 'Structural inspection video',
        fileSize: 10485760,
        mimeType: 'video/mp4',
        projectId: 'proj-123',
        is360: false,
      };

      const result = await controller.initUpload(dto, { user: { id: 'usr-888' } });
      expect(result).toEqual(mockSessionResponse);
      expect(service.initUploadSession).toHaveBeenCalledWith(dto, 'usr-888');
    });
  });

  describe('uploadChunk', () => {
    it('should receive file chunk and upload', async () => {
      const result = await controller.uploadChunk(
        'tok_abc123',
        { chunkIndex: 0, totalChunks: 2 },
        { buffer: Buffer.from('chunk content') },
        { user: { id: 'usr-888' } },
      );

      expect(result).toBeDefined();
      expect(result.status).toBe('UPLOADING');
      expect(service.uploadChunk).toHaveBeenCalled();
    });
  });

  describe('getSessionStatus', () => {
    it('should return session status', async () => {
      const result = await controller.getSessionStatus('tok_abc123');
      expect(result).toBeDefined();
      expect(result.progressPercent).toBe(50);
    });
  });

  describe('findOne', () => {
    it('should return single video details', async () => {
      const result = await controller.findOne('vid-abc');
      expect(result).toEqual(mockVideo);
    });
  });

  describe('update', () => {
    it('should update video and log auditing', async () => {
      const dto = { name: 'Updated Name' };
      const result = await controller.update('vid-abc', dto, { user: { id: 'usr-888' } });
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('remove', () => {
    it('should soft delete video', async () => {
      const result = await controller.remove('vid-abc', { user: { id: 'usr-888' } });
      expect(result.deletedAt).toBeDefined();
    });
  });
});
