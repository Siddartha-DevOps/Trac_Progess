import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
  IsUUID,
  IsNumber,
  Min,
  IsInt,
  IsIn,
  IsObject,
} from 'class-validator';

export class CreateFloorDto {
  @ApiProperty({
    description: 'The vertical designation name of the floor.',
    example: 'Ground Floor',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Floor name cannot be empty.' })
  @Length(3, 100, { message: 'Floor name must be between 3 and 100 characters.' })
  name: string;

  @ApiPropertyOptional({
    description: 'A detailed summary or construction scope of the floor.',
    example: 'Ground floor featuring standard lobby and structural support columns.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500, { message: 'Description cannot exceed 500 characters.' })
  description?: string;

  @ApiProperty({
    description: 'The physical level number. E.g., 0 for ground, 1 for first floor, -1 for basement.',
    example: 0,
  })
  @IsInt({ message: 'Level number must be an integer.' })
  @IsNotEmpty({ message: 'Level number is required.' })
  number: number;

  @ApiProperty({
    description: 'The relative sort or execution order index of the floor for rendering lists/sequencing.',
    example: 0,
  })
  @IsInt({ message: 'Order must be an integer.' })
  @IsNotEmpty({ message: 'Order index is required.' })
  order: number;

  @ApiPropertyOptional({
    description: 'Total floor area in square feet (sqft) or localized metric.',
    example: 4500.5,
    default: 0.0,
  })
  @IsNumber({}, { message: 'Total area must be a valid float.' })
  @Min(0, { message: 'Total area cannot be negative.' })
  @IsOptional()
  totalArea?: number = 0.0;

  @ApiPropertyOptional({
    description: 'The current construction phase status of this specific floor.',
    example: 'PLANNING',
    enum: ['PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED'],
    default: 'PLANNING',
  })
  @IsString()
  @IsOptional()
  @IsIn(['PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED'], {
    message: 'Status must be one of: PLANNING, UNDER_CONSTRUCTION, COMPLETED',
  })
  status?: string = 'PLANNING';

  @ApiPropertyOptional({
    description: 'Extensible JSON block for custom attributes or specifications.',
    example: { structuralCheckCompleted: true, inspectorSignature: 'Rajesh Kumar' },
  })
  @IsObject({ message: 'Metadata must be a valid JSON object.' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'The unique parent building ID (UUID v4) owning this floor.',
    example: 'b1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  @IsUUID('4', { message: 'buildingId must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'buildingId is required.' })
  buildingId: string;
}
