import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  Length,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsIn,
  IsObject,
} from 'class-validator';

export class CreateBuildingDto {
  @ApiProperty({
    description: 'The structural name of the building within the project site.',
    example: 'Tower A',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Building name cannot be empty.' })
  @Length(3, 100, { message: 'Building name must be between 3 and 100 characters.' })
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed description of building usage or design characteristics.',
    example: 'Residential block with integrated community hall.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500, { message: 'Description cannot exceed 500 characters.' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Programmatic building usage classification.',
    example: 'RESIDENTIAL',
    enum: ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED_USE', 'OTHER'],
    default: 'RESIDENTIAL',
  })
  @IsString()
  @IsOptional()
  @IsIn(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED_USE', 'OTHER'], {
    message: 'Type must be one of: RESIDENTIAL, COMMERCIAL, INDUSTRIAL, MIXED_USE, OTHER',
  })
  type?: string = 'RESIDENTIAL';

  @ApiPropertyOptional({
    description: 'The current construction phase status of this specific building.',
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
    description: 'Total number of floors above ground level.',
    example: 14,
    default: 1,
  })
  @IsInt({ message: 'Floors must be an integer.' })
  @Min(1, { message: 'Floors must be at least 1.' })
  @IsOptional()
  floors?: number = 1;

  @ApiPropertyOptional({
    description: 'Total number of basement floors below ground level.',
    example: 2,
    default: 0,
  })
  @IsInt({ message: 'Basement floors must be an integer.' })
  @Min(0, { message: 'Basement floors cannot be negative.' })
  @IsOptional()
  basementFloors?: number = 0;

  @ApiPropertyOptional({
    description: 'Total floor area in square feet (sqft) or localized standard metric.',
    example: 75000.5,
    default: 0.0,
  })
  @IsNumber({}, { message: 'Total area must be a valid float.' })
  @Min(0, { message: 'Total area cannot be negative.' })
  @IsOptional()
  totalArea?: number = 0.0;

  @ApiPropertyOptional({
    description: 'Available car/vehicle parking spaces allocated within the building.',
    example: 120,
    default: 0,
  })
  @IsInt({ message: 'Parking spaces must be an integer.' })
  @Min(0, { message: 'Parking spaces cannot be negative.' })
  @IsOptional()
  parkingSpaces?: number = 0;

  @ApiPropertyOptional({
    description: 'Extensible JSON block for custom attributes or specifications.',
    example: { constructionMethod: 'Precast Concrete', structuralEngineer: 'Meinhardt' },
  })
  @IsObject({ message: 'Metadata must be a valid JSON object.' })
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Physical address of the building structure.',
    example: 'Plot No 23, Electronic City Phase 1',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'City where the building is situated.',
    example: 'Bangalore',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'State or province.',
    example: 'Karnataka',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'Postal zip code or pin code.',
    example: '560100',
  })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'GPS coordinate - Latitude.',
    example: 12.8456,
    minimum: -90,
    maximum: 90,
  })
  @IsNumber({}, { message: 'Latitude must be a valid float value.' })
  @Min(-90, { message: 'Latitude must be between -90 and 90.' })
  @Max(90, { message: 'Latitude must be between -90 and 90.' })
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'GPS coordinate - Longitude.',
    example: 77.6632,
    minimum: -180,
    maximum: 180,
  })
  @IsNumber({}, { message: 'Longitude must be a valid float value.' })
  @Min(-180, { message: 'Longitude must be between -180 and 180.' })
  @Max(180, { message: 'Longitude must be between -180 and 180.' })
  @IsOptional()
  longitude?: number;

  @ApiProperty({
    description: 'The unique parent project ID (UUID v4) owning this building.',
    example: 'd1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  @IsUUID('4', { message: 'projectId must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'projectId is required.' })
  projectId: string;
}
