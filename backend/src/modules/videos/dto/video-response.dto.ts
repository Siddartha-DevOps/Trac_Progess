import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VideoUploadSessionResponseDto {
  @ApiProperty({ example: 'session-uuid-111' })
  id: string;

  @ApiProperty({ example: 'tok_abc123xyz' })
  uploadToken: string;

  @ApiProperty({ example: 'drone_scan.mp4' })
  fileName: string;

  @ApiProperty({ example: 52428800 })
  fileSize: number;

  @ApiProperty({ example: 5242880 })
  chunkSize: number;

  @ApiProperty({ example: 10 })
  totalChunks: number;

  @ApiProperty({ example: [0, 1, 2] })
  uploadedChunks: number[];

  @ApiProperty({ example: 'UPLOADING' })
  status: string;

  @ApiProperty({ example: 30 })
  progressPercent: number;

  @ApiProperty({ example: 'proj-111' })
  projectId: string;

  @ApiProperty({ example: '2026-07-10T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-10T10:00:00.000Z' })
  updatedAt: Date;
}

export class VideoResponseDto {
  @ApiProperty({ example: 'video-uuid-111' })
  id: string;

  @ApiProperty({ example: 'Tower A Drone Concrete Inspection' })
  name: string;

  @ApiPropertyOptional({ example: 'High resolution scan level 12' })
  description?: string;

  @ApiPropertyOptional({ example: 'https://storage.buildtrace.in/videos/compressed_video.mp4' })
  fileUrl?: string;

  @ApiPropertyOptional({ example: 'https://storage.buildtrace.in/videos/original_video.mp4' })
  originalUrl?: string;

  @ApiPropertyOptional({ example: 'https://storage.buildtrace.in/videos/compressed_video.mp4' })
  compressedUrl?: string;

  @ApiPropertyOptional({ example: 'https://storage.buildtrace.in/videos/thumbnail.jpg' })
  thumbnailUrl?: string;

  @ApiProperty({ example: 52428800 })
  fileSize: number;

  @ApiProperty({ example: 'video/mp4' })
  mimeType: string;

  @ApiProperty({ example: false })
  is360: boolean;

  @ApiProperty({ example: 'COMPLETED' })
  status: string;

  @ApiProperty({ example: 'COMPLETED' })
  compressionStatus: string;

  @ApiPropertyOptional({
    example: {
      resolution: '1920x1080',
      duration: 124.5,
      fps: 30,
      codec: 'h264',
      projectionType: 'equirectangular',
    }
  })
  metadata?: any;

  @ApiProperty({ example: 'proj-111' })
  projectId: string;

  @ApiPropertyOptional({ example: 'user-333' })
  uploadedById?: string;

  @ApiProperty({ example: '2026-07-10T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-07-10T10:00:00.000Z' })
  updatedAt: Date;

  @ApiPropertyOptional({ example: null })
  deletedAt?: Date;
}

export class PaginatedVideoResponseDto {
  @ApiProperty({ type: () => [VideoResponseDto] })
  items: VideoResponseDto[];

  @ApiProperty({
    example: {
      totalItems: 5,
      itemCount: 5,
      itemsPerPage: 10,
      totalPages: 1,
      currentPage: 1,
    }
  })
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
