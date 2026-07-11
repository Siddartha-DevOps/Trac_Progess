import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  Length,
  IsNumber,
  Min,
  IsInt,
  IsIn,
  IsObject,
} from 'class-validator';

export class UpdateFloorDto {
  @ApiPropertyOptional({
    description: 'Updated vertical designation name of the floor.',
    example: 'Ground Floor Lobby',
  })
  @IsString()
  @IsOptional()
  @Length(3, 100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated description of floor details or structural characteristics.',
    example: 'Updated Ground floor description.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated level number of the floor (0 = Ground, 1 = 1st, etc.).',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  number?: number;

  @ApiPropertyOptional({
    description: 'Updated sequencing order of the floor.',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  order?: number;

  @ApiPropertyOptional({
    description: 'Updated total square footage or square meter area.',
    example: 5200.0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalArea?: number;

  @ApiPropertyOptional({
    description: 'Updated construction status.',
    example: 'UNDER_CONSTRUCTION',
    enum: ['PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Updated custom metadata parameter block.',
    example: { structuralCheckCompleted: true, inspectorSignature: 'Rajesh Kumar' },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
