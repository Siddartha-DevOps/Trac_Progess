import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, IsBoolean, IsIn, IsObject } from 'class-validator';

export class UpdateVideoDto {
  @ApiPropertyOptional({
    description: 'Name of the video.',
    example: 'Tower A Level 12 Drone Scan Revised',
  })
  @IsString()
  @IsOptional()
  @Length(2, 150, { message: 'Video name must be between 2 and 150 characters.' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the video content.',
    example: 'Updated description for drone flight path.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500, { message: 'Description cannot exceed 500 characters.' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Flag indicating if the video is 360.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  is360?: boolean;

  @ApiPropertyOptional({
    description: 'Manual processing status update.',
    example: 'COMPLETED',
    enum: ['UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['UPLOADING', 'PROCESSING', 'COMPLETED', 'FAILED'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Extracted structural metadata block.',
    example: { resolution: '3840x2160', duration: 45.2, fps: 30, codec: 'h264' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
