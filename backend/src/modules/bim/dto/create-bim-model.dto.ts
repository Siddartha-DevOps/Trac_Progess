import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
  IsUUID,
  IsIn,
  IsObject,
  IsNumber,
} from 'class-validator';

export class CreateBimModelDto {
  @ApiProperty({
    description: 'The name of the BIM model.',
    example: 'Bangalore Tech Park Block A',
    minLength: 2,
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty({ message: 'BIM model name cannot be empty.' })
  @Length(2, 150, { message: 'BIM model name must be between 2 and 150 characters.' })
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed description of this model or discipline context.',
    example: 'Structural structural discipline template including columns, beams, and slabs.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500, { message: 'Description cannot exceed 500 characters.' })
  description?: string;

  @ApiProperty({
    description: 'The URL of the uploaded IFC or Revit file.',
    example: 'https://storage.buildtrace.in/models/bld-111_struc_v1.ifc',
  })
  @IsString()
  @IsNotEmpty({ message: 'File URL is required.' })
  fileUrl: string;

  @ApiProperty({
    description: 'The file format/type of the BIM model.',
    example: 'IFC',
    enum: ['IFC', 'RVT'],
  })
  @IsString()
  @IsNotEmpty({ message: 'File type is required.' })
  @IsIn(['IFC', 'RVT'], { message: 'File type must be either IFC or RVT.' })
  fileType: string;

  @ApiProperty({
    description: 'The associated Project ID.',
    example: 'proj-111',
  })
  @IsUUID('4', { message: 'Project ID must be a valid UUID.' })
  @IsNotEmpty({ message: 'Project ID is required.' })
  projectId: string;

  @ApiPropertyOptional({
    description: 'Optional coordinate system configurations, like CRS, origin reference, and scaling factors.',
    example: { crs: 'EPSG:3857', origin: [0, 0, 0], scale: 1.0 },
  })
  @IsObject({ message: 'Coordinate system must be a valid JSON object.' })
  @IsOptional()
  coordinateSystem?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Extensible metadata block (e.g. software version, authoring tool, levels count).',
    example: { author: 'Autodesk Revit 2024', levelsCount: 15, elementsCount: 840 },
  })
  @IsObject({ message: 'Metadata must be a valid JSON object.' })
  @IsOptional()
  metadata?: Record<string, any>;
}
