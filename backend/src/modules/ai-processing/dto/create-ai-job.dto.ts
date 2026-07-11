import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  Min,
  IsIn,
  IsObject,
  IsBoolean,
} from 'class-validator';

export class CreateAiJobDto {
  @ApiProperty({
    description: 'The operational category of the AI processing task.',
    example: 'FRAME_EXTRACTION',
    enum: ['FRAME_EXTRACTION', 'YOLO_VERIFICATION', 'ALIGNMENT_SANDBOX', 'GEMINI_REMEDIATION'],
  })
  @IsString()
  @IsNotEmpty({ message: 'Job type cannot be empty.' })
  @IsIn(['FRAME_EXTRACTION', 'YOLO_VERIFICATION', 'ALIGNMENT_SANDBOX', 'GEMINI_REMEDIATION'], {
    message: 'jobType must be one of: FRAME_EXTRACTION, YOLO_VERIFICATION, ALIGNMENT_SANDBOX, GEMINI_REMEDIATION',
  })
  jobType: string;

  @ApiProperty({
    description: 'The unique project identifier GUID containing this AI job.',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-1234567890ab',
  })
  @IsUUID('4', { message: 'projectId must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'projectId is required.' })
  projectId: string;

  @ApiPropertyOptional({
    description: 'The unique associated Video scanner GUID if processing a site walkthrough.',
    example: 'v1b2c3d4-e5f6-7a8b-9c0d-0987654321ba',
  })
  @IsUUID('4', { message: 'videoId must be a valid UUID v4.' })
  @IsOptional()
  videoId?: string;

  @ApiPropertyOptional({
    description: 'Core input settings, boundaries, or hyperparameters as a JSON object.',
    example: { frameStride: 15, confidenceThreshold: 0.85, resizeWidth: 1080 },
  })
  @IsObject({ message: 'Payload must be a valid JSON object.' })
  @IsOptional()
  payload?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Processing queue priority weight. Higher priority resolves first.',
    example: 2,
    default: 0,
  })
  @IsNumber({}, { message: 'Priority must be a valid integer.' })
  @Min(0, { message: 'Priority cannot be negative.' })
  @IsOptional()
  priority?: number = 0;

  @ApiPropertyOptional({
    description: 'Flag requesting scheduling on an enterprise GPU hardware node.',
    example: true,
    default: false,
  })
  @IsBoolean({ message: 'gpuRequired must be a boolean.' })
  @IsOptional()
  gpuRequired?: boolean = false;

  @ApiPropertyOptional({
    description: 'Maximum permitted failure retry attempts.',
    example: 3,
    default: 3,
  })
  @IsNumber({}, { message: 'Max retries must be an integer.' })
  @Min(0, { message: 'Max retries cannot be negative.' })
  @IsOptional()
  maxRetries?: number = 3;
}
