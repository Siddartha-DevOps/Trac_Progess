import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { InitUploadDto } from './dto/init-upload.dto';
import { QueryVideoDto } from './dto/query-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VideosRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createVideo(dto: InitUploadDto, uploadedById?: string) {
    return this.prisma.video.create({
      data: {
        name: dto.name.trim(),
        description: dto.description,
        fileSize: dto.fileSize,
        mimeType: dto.mimeType,
        is360: dto.is360 || false,
        status: 'UPLOADING',
        compressionStatus: 'PENDING',
        projectId: dto.projectId,
        uploadedById,
      },
    });
  }

  async createUploadSession(
    uploadToken: string,
    fileName: string,
    fileSize: number,
    chunkSize: number,
    totalChunks: number,
    projectId: string
  ) {
    return this.prisma.videoUploadSession.create({
      data: {
        uploadToken,
        fileName,
        fileSize,
        chunkSize,
        totalChunks,
        uploadedChunks: [] as any, // json array
        status: 'INITIALIZED',
        projectId,
      },
    });
  }

  async findSessionByToken(uploadToken: string) {
    return this.prisma.videoUploadSession.findUnique({
      where: { uploadToken },
    });
  }

  async updateUploadSession(id: string, status: string, uploadedChunks: number[]) {
    return this.prisma.videoUploadSession.update({
      where: { id },
      data: {
        status,
        uploadedChunks: uploadedChunks as any,
      },
    });
  }

  async findVideoById(id: string, includeDeleted = false) {
    return this.prisma.video.findFirst({
      where: { id, deletedAt: includeDeleted ? undefined : null },
      include: { project: true },
    });
  }

  async updateVideo(id: string, dto: UpdateVideoDto) {
    const data: Prisma.VideoUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name.trim();
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.is360 !== undefined) data.is360 = dto.is360;
    if (dto.status !== undefined) data.status = dto.status;
    if (dto.metadata !== undefined) data.metadata = dto.metadata;

    return this.prisma.video.update({
      where: { id },
      data,
    });
  }

  async updateVideoStorageDetails(
    id: string,
    update: {
      fileUrl: string;
      originalUrl: string;
      compressedUrl: string;
      thumbnailUrl: string;
      status: string;
      compressionStatus: string;
      metadata: any;
    }
  ) {
    return this.prisma.video.update({
      where: { id },
      data: {
        fileUrl: update.fileUrl,
        originalUrl: update.originalUrl,
        compressedUrl: update.compressedUrl,
        thumbnailUrl: update.thumbnailUrl,
        status: update.status,
        compressionStatus: update.compressionStatus,
        metadata: update.metadata,
      },
    });
  }

  async findAllVideos(query: QueryVideoDto) {
    const { projectId, is360, status, search, page = 1, limit = 10 } = query;
    const where: Prisma.VideoWhereInput = { deletedAt: null };

    if (projectId) where.projectId = projectId;
    if (is360 !== undefined) where.is360 = is360;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, totalItems] = await Promise.all([
      this.prisma.video.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.video.count({ where }),
    ]);

    return { items, totalItems };
  }

  async softDeleteVideo(id: string) {
    return this.prisma.video.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restoreVideo(id: string) {
    return this.prisma.video.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
