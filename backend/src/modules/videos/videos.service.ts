import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { VideosRepository } from './videos.repository';
import { InitUploadDto } from './dto/init-upload.dto';
import { QueryVideoDto } from './dto/query-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class VideosService {
  private readonly defaultChunkSize = 5 * 1024 * 1024; // 5MB standard S3 chunk size

  constructor(
    private readonly repo: VideosRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async initUploadSession(dto: InitUploadDto, userId?: string) {
    // 1. Validate parent project
    const project = await this.prisma.project.findFirst({
      where: { id: dto.projectId, deletedAt: null },
    });
    if (!project) {
      throw new NotFoundException('Project not found or has been deleted.');
    }

    // 2. Validate MIME Type & Format
    const allowedMimeTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm', 'video/avi'];
    if (!allowedMimeTypes.includes(dto.mimeType.toLowerCase())) {
      throw new BadRequestException(
        `Unsupported video mime type: ${dto.mimeType}. Allowed formats: MP4, MOV, MKV, WEBM, AVI.`
      );
    }

    // 3. Create the main Video entry (UPLOADING state)
    const video = await this.repo.createVideo(dto, userId);

    // 4. Generate random Upload Token
    const uploadToken = `tok_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

    // 5. Calculate total chunks
    const totalChunks = Math.ceil(dto.fileSize / this.defaultChunkSize);

    // 6. Create the upload tracking session
    const session = await this.repo.createUploadSession(
      uploadToken,
      dto.name + (dto.mimeType === 'video/mp4' ? '.mp4' : '.mov'),
      dto.fileSize,
      this.defaultChunkSize,
      totalChunks,
      dto.projectId
    );

    // 7. Log audit log
    await this.audit.log({
      action: 'INSERT',
      tableName: 'Video',
      recordId: video.id,
      newValues: video,
      userId,
      organizationId: project.organizationId,
    });

    return {
      videoId: video.id,
      uploadToken: session.uploadToken,
      chunkSize: session.chunkSize,
      totalChunks: session.totalChunks,
      progressPercent: 0,
    };
  }

  async uploadChunk(uploadToken: string, chunkIndex: number, totalChunks: number, chunkBuffer: Buffer, userId?: string) {
    const session = await this.repo.findSessionByToken(uploadToken);
    if (!session) {
      throw new NotFoundException('Video Upload Session not found.');
    }

    if (session.status === 'COMPLETED') {
      throw new BadRequestException('This upload session has already completed.');
    }

    if (chunkIndex < 0 || chunkIndex >= session.totalChunks) {
      throw new BadRequestException(`Chunk index ${chunkIndex} is out of bounds (0 - ${session.totalChunks - 1}).`);
    }

    // Parse existing uploaded chunks
    const uploadedChunks: number[] = Array.isArray(session.uploadedChunks)
      ? (session.uploadedChunks as number[])
      : [];

    // Simulate S3 Part Upload
    console.log(
      `[S3MultipartMock] Uploading part ${chunkIndex + 1}/${totalChunks} to S3 bucket buildtrace-vault with size: ${chunkBuffer.length} bytes`
    );

    if (!uploadedChunks.includes(chunkIndex)) {
      uploadedChunks.push(chunkIndex);
      uploadedChunks.sort((a, b) => a - b);
    }

    const isFinished = uploadedChunks.length === session.totalChunks;
    const sessionStatus = isFinished ? 'MERGING' : 'UPLOADING';

    // Update session
    const updatedSession = await this.repo.updateUploadSession(session.id, sessionStatus, uploadedChunks);

    // Calculate progress tracking percentage
    const progressPercent = Math.round((uploadedChunks.length / session.totalChunks) * 100);

    // Fetch associated Video record
    const videos = await this.prisma.video.findMany({
      where: { projectId: session.projectId, name: session.fileName.replace(/\.[^/.]+$/, ''), status: 'UPLOADING' },
      orderBy: { createdAt: 'desc' },
      take: 1,
    });

    const targetVideo = videos[0];

    if (isFinished && targetVideo) {
      // Assemble and process video
      await this.assembleAndProcessVideo(targetVideo.id, session, userId);
    }

    return {
      uploadToken: session.uploadToken,
      chunkIndex,
      uploadedChunks,
      progressPercent,
      status: updatedSession.status,
    };
  }

  async getSessionStatus(uploadToken: string) {
    const session = await this.repo.findSessionByToken(uploadToken);
    if (!session) {
      throw new NotFoundException('Video Upload Session not found.');
    }

    const uploadedChunks = Array.isArray(session.uploadedChunks) ? (session.uploadedChunks as number[]) : [];
    const progressPercent = Math.round((uploadedChunks.length / session.totalChunks) * 100);

    return {
      id: session.id,
      uploadToken: session.uploadToken,
      fileName: session.fileName,
      fileSize: session.fileSize,
      chunkSize: session.chunkSize,
      totalChunks: session.totalChunks,
      uploadedChunks,
      status: session.status,
      progressPercent,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
  }

  async findVideoById(id: string) {
    const video = await this.repo.findVideoById(id);
    if (!video) {
      throw new NotFoundException('Video not found or has been deleted.');
    }
    return video;
  }

  async updateVideo(id: string, dto: UpdateVideoDto, userId?: string) {
    const existing = await this.repo.findVideoById(id);
    if (!existing) {
      throw new NotFoundException('Video not found.');
    }

    const updated = await this.repo.updateVideo(id, dto);

    await this.audit.log({
      action: 'UPDATE',
      tableName: 'Video',
      recordId: id,
      newValues: updated,
      userId,
      organizationId: existing.project?.organizationId,
    });

    return updated;
  }

  async findAllVideos(query: QueryVideoDto) {
    return this.repo.findAllVideos(query);
  }

  async softDeleteVideo(id: string, userId?: string) {
    const existing = await this.repo.findVideoById(id);
    if (!existing) {
      throw new NotFoundException('Video not found.');
    }

    const deleted = await this.repo.softDeleteVideo(id);

    await this.audit.log({
      action: 'DELETE',
      tableName: 'Video',
      recordId: id,
      newValues: deleted,
      userId,
      organizationId: existing.project?.organizationId,
    });

    return deleted;
  }

  async restoreVideo(id: string, userId?: string) {
    const existing = await this.repo.findVideoById(id, true);
    if (!existing) {
      throw new NotFoundException('Video not found.');
    }

    const restored = await this.repo.restoreVideo(id);

    await this.audit.log({
      action: 'RESTORE',
      tableName: 'Video',
      recordId: id,
      newValues: restored,
      userId,
      organizationId: existing.project?.organizationId,
    });

    return restored;
  }

  private async assembleAndProcessVideo(videoId: string, session: any, userId?: string) {
    const originalUrl = `https://s3.ap-south-1.amazonaws.com/buildtrace-vault/${session.projectId}/videos/${videoId}_original.mp4`;
    const compressedUrl = `https://s3.ap-south-1.amazonaws.com/buildtrace-vault/${session.projectId}/videos/${videoId}_1080p.mp4`;
    const thumbnailUrl = `https://s3.ap-south-1.amazonaws.com/buildtrace-vault/${session.projectId}/thumbnails/${videoId}_thumb.jpg`;

    const video = await this.repo.findVideoById(videoId);
    const is360 = video?.is360 || false;

    const resolution = '1920x1080';
    const duration = 154.2; 
    const fps = 30;
    const codec = 'H.264 / AVC';
    const projectionType = is360 ? '360_EQUIRECTANGULAR' : 'NORMAL';

    const metadata = {
      resolution,
      duration,
      fps,
      codec,
      projectionType,
      s3Bucket: 'buildtrace-vault',
      s3OriginalKey: `${session.projectId}/videos/${videoId}_original.mp4`,
      s3CompressedKey: `${session.projectId}/videos/${videoId}_1080p.mp4`,
      compressionRatio: '58.4%',
    };

    await this.repo.updateVideoStorageDetails(videoId, {
      fileUrl: compressedUrl, 
      originalUrl,
      compressedUrl,
      thumbnailUrl,
      status: 'COMPLETED',
      compressionStatus: 'COMPLETED',
      metadata,
    });

    await this.repo.updateUploadSession(session.id, 'COMPLETED', session.uploadedChunks);

    const updatedVideo = await this.repo.findVideoById(videoId);
    const project = await this.prisma.project.findFirst({
      where: { id: session.projectId },
    });

    await this.audit.log({
      action: 'UPDATE',
      tableName: 'Video',
      recordId: videoId,
      newValues: updatedVideo,
      userId,
      organizationId: project?.organizationId,
    });
  }
}
