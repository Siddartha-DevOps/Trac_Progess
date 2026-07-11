import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  Length,
  IsNumber,
  Min,
  Max,
  IsInt,
  IsIn,
  IsObject,
} from 'class-validator';

export class UpdateBuildingDto {
  @ApiPropertyOptional({
    description: 'Updated structural name of the building.',
    example: 'Tower A - Main Wing',
  })
  @IsString()
  @IsOptional()
  @Length(3, 100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated descriptive summary of the building scope.',
    example: 'Tower A multi-unit structure focusing on luxury layout.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated usage classification of the building.',
    example: 'MIXED_USE',
    enum: ['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED_USE', 'OTHER'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'MIXED_USE', 'OTHER'])
  type?: string;

  @ApiPropertyOptional({
    description: 'Updated construction phase status.',
    example: 'UNDER_CONSTRUCTION',
    enum: ['PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED', 'COMMISSIONED'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED', 'COMMISSIONED'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Updated floor count above ground.',
    example: 18,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  floors?: number;

  @ApiPropertyOptional({
    description: 'Updated basement floor count.',
    example: 3,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  basementFloors?: number;

  @ApiPropertyOptional({
    description: 'Updated total area size (sqft).',
    example: 95000.0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalArea?: number;

  @ApiPropertyOptional({
    description: 'Updated parking spaces count.',
    example: 150,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  parkingSpaces?: number;

  @ApiPropertyOptional({
    description: 'Updated JSON metadata block.',
    example: { constructionMethod: 'Precast Concrete', interiorContractor: 'L&T' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Updated physical address.',
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({
    description: 'Updated city location.',
  })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiPropertyOptional({
    description: 'Updated state location.',
  })
  @IsString()
  @IsOptional()
  state?: string;

  @ApiPropertyOptional({
    description: 'Updated postal zip/pin code.',
  })
  @IsString()
  @IsOptional()
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'Updated latitude GPS coordinate.',
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;

  @ApiPropertyOptional({
    description: 'Updated longitude GPS coordinate.',
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  @IsOptional()
  longitude?: number;
}
