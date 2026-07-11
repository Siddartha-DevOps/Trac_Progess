import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  Length,
  IsNumber,
  Min,
  IsIn,
  IsObject,
} from 'class-validator';

export class UpdateRoomDto {
  @ApiPropertyOptional({
    description: 'Updated name/designation of the room.',
    example: 'Office 101 - Executive Suite',
  })
  @IsString()
  @IsOptional()
  @Length(2, 100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated categorical classification of the room.',
    example: 'CONFERENCE',
    enum: ['OFFICE', 'CONFERENCE', 'LOBBY', 'RESTROOM', 'MECHANICAL', 'RESIDENTIAL', 'OTHER'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['OFFICE', 'CONFERENCE', 'LOBBY', 'RESTROOM', 'MECHANICAL', 'RESIDENTIAL', 'OTHER'])
  category?: string;

  @ApiPropertyOptional({
    description: 'Updated construction status.',
    example: 'UNDER_CONSTRUCTION',
    enum: ['PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED', 'COMMISSIONED'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED', 'COMMISSIONED'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Updated detailed description.',
    example: 'Updated description of room utility.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated total area.',
    example: 195.0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalArea?: number;

  @ApiPropertyOptional({
    description: 'Updated ceiling height.',
    example: 10.0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  height?: number;

  @ApiPropertyOptional({
    description: 'Updated perimeter.',
    example: 56.5,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  perimeter?: number;

  @ApiPropertyOptional({
    description: 'Updated geometry polygon layout JSON object.',
    example: { type: 'Polygon', coordinates: [[[0, 0], [0, 15], [13, 15], [13, 0], [0, 0]]] },
  })
  @IsObject()
  @IsOptional()
  geometry?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Updated custom metadata parameter block.',
    example: { fixturesCount: 8, keyCardAccess: true },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
