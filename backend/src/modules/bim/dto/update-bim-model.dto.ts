import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  Length,
  IsIn,
  IsObject,
} from 'class-validator';

export class UpdateBimModelDto {
  @ApiPropertyOptional({
    description: 'The name of the BIM model.',
    example: 'Bangalore Tech Park Block A - Structural Revision',
  })
  @IsString()
  @IsOptional()
  @Length(2, 150, { message: 'BIM model name must be between 2 and 150 characters.' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of this model or discipline context.',
    example: 'Updated HVAC layout with revised ducts positions.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500, { message: 'Description cannot exceed 500 characters.' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Current parsing or verification state of the BIM model.',
    example: 'COMPLETED',
    enum: ['PROCESSING', 'COMPLETED', 'FAILED'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['PROCESSING', 'COMPLETED', 'FAILED'], { message: 'Status must be PROCESSING, COMPLETED, or FAILED.' })
  status?: string;

  @ApiPropertyOptional({
    description: 'BIM Coordinate system alignments.',
    example: { crs: 'EPSG:3857', origin: [100.5, 200.1, 0.0] },
  })
  @IsObject()
  @IsOptional()
  coordinateSystem?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Metadata block including metrics or custom parsing information.',
    example: { author: 'Trimble Nova v18', parsedElements: 1250 },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
