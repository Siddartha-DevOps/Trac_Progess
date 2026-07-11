import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryAiJobDto {
  @ApiPropertyOptional({
    description: 'Filter background jobs within a specific Project.',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1234567890ab',
  })
  @IsUUID('4', { message: 'projectId must be a valid UUID v4.' })
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Filter background jobs by operational status.',
    example: 'PROCESSING',
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRYING'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'RETRYING'], {
    message: 'status must be one of: PENDING, PROCESSING, COMPLETED, FAILED, RETRYING',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter background jobs by job type classification.',
    example: 'YOLO_VERIFICATION',
    enum: ['FRAME_EXTRACTION', 'YOLO_VERIFICATION', 'ALIGNMENT_SANDBOX', 'GEMINI_REMEDIATION'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['FRAME_EXTRACTION', 'YOLO_VERIFICATION', 'ALIGNMENT_SANDBOX', 'GEMINI_REMEDIATION'], {
    message: 'jobType must be one of: FRAME_EXTRACTION, YOLO_VERIFICATION, ALIGNMENT_SANDBOX, GEMINI_REMEDIATION',
  })
  jobType?: string;

  @ApiPropertyOptional({
    description: 'The target page number for paginated results.',
    example: 1,
    default: 1,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'The number of records per page.',
    example: 10,
    default: 10,
  })
  @IsNumber()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}
