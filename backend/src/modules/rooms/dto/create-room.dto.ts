import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
  IsUUID,
  IsNumber,
  Min,
  IsIn,
  IsObject,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({
    description: 'The identification name/number of the room.',
    example: 'Office 101',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Room name cannot be empty.' })
  @Length(2, 100, { message: 'Room name must be between 2 and 100 characters.' })
  name: string;

  @ApiPropertyOptional({
    description: 'The categorical classification of the room.',
    example: 'OFFICE',
    enum: ['OFFICE', 'CONFERENCE', 'LOBBY', 'RESTROOM', 'MECHANICAL', 'RESIDENTIAL', 'OTHER'],
    default: 'OFFICE',
  })
  @IsString()
  @IsOptional()
  @IsIn(['OFFICE', 'CONFERENCE', 'LOBBY', 'RESTROOM', 'MECHANICAL', 'RESIDENTIAL', 'OTHER'], {
    message: 'Category must be one of: OFFICE, CONFERENCE, LOBBY, RESTROOM, MECHANICAL, RESIDENTIAL, OTHER',
  })
  category?: string = 'OFFICE';

  @ApiPropertyOptional({
    description: 'Current development/construction phase status of this room.',
    example: 'PLANNING',
    enum: ['PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED', 'COMMISSIONED'],
    default: 'PLANNING',
  })
  @IsString()
  @IsOptional()
  @IsIn(['PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED', 'COMMISSIONED'], {
    message: 'Status must be one of: PLANNING, UNDER_CONSTRUCTION, COMPLETED, COMMISSIONED',
  })
  status?: string = 'PLANNING';

  @ApiPropertyOptional({
    description: 'Detailed description or architectural remarks.',
    example: 'Corner office room with dual-aspect window frames and integrated electrical conduits.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500, { message: 'Description cannot exceed 500 characters.' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Total usable physical floor area in square feet or meters.',
    example: 180.5,
    default: 0.0,
  })
  @IsNumber({}, { message: 'Total area must be a valid float.' })
  @Min(0, { message: 'Total area cannot be negative.' })
  @IsOptional()
  totalArea?: number = 0.0;

  @ApiPropertyOptional({
    description: 'Floor to ceiling height of the room.',
    example: 9.5,
    default: 0.0,
  })
  @IsNumber({}, { message: 'Height must be a valid float.' })
  @Min(0, { message: 'Height cannot be negative.' })
  @IsOptional()
  height?: number = 0.0;

  @ApiPropertyOptional({
    description: 'Perimeter measurement of the room bounds.',
    example: 54.0,
    default: 0.0,
  })
  @IsNumber({}, { message: 'Perimeter must be a valid float.' })
  @Min(0, { message: 'Perimeter cannot be negative.' })
  @IsOptional()
  perimeter?: number = 0.0;

  @ApiPropertyOptional({
    description: 'Structural geometry data describing polygon layouts or coordinates.',
    example: { type: 'Polygon', coordinates: [[[0, 0], [0, 15], [12, 15], [12, 0], [0, 0]]] },
  })
  @IsObject({ message: 'Geometry must be a valid JSON object.' })
  @IsOptional()
  geometry?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Extensible JSON block for custom attributes, hardware lists, or custom parameters.',
    example: { fixturesCount: 6, keyCardAccess: true },
  })
  @IsObject({ message: 'Metadata must be a valid JSON object.' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'The unique parent floor level ID (UUID v4) containing this room.',
    example: 'f1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  @IsUUID('4', { message: 'floorId must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'floorId is required.' })
  floorId: string;
}
