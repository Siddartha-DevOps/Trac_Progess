import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryRoomDto {
  @ApiPropertyOptional({
    description: 'Filter rooms linked specifically to a parent floor level ID.',
    example: 'f1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  @IsUUID('4')
  @IsOptional()
  floorId?: string;

  @ApiPropertyOptional({
    description: 'Filter rooms matching a specific development category.',
    example: 'OFFICE',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter rooms matching a specific construction status.',
    example: 'UNDER_CONSTRUCTION',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Text search query matching room name, description or category.',
    example: 'Office',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'The page number for offset pagination (1-indexed).',
    example: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Maximum item count returned per pagination page.',
    example: 10,
    default: 10,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Whether to include soft-deleted/archived rooms in search results.',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDeleted?: boolean = false;
}
