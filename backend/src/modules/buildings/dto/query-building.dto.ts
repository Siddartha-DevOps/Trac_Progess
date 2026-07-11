import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryBuildingDto {
  @ApiPropertyOptional({
    description: 'Filter buildings specifically linked to this parent project ID.',
    example: 'd1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  @IsUUID('4')
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Filter buildings matching a specific status.',
    example: 'UNDER_CONSTRUCTION',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter buildings matching a specific type.',
    example: 'RESIDENTIAL',
  })
  @IsString()
  @IsOptional()
  type?: string;

  @ApiPropertyOptional({
    description: 'Text search matching building name, description, address, or city.',
    example: 'Tower A',
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
    description: 'Maximum item count returning on each pagination page.',
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
    description: 'Whether to include soft-deleted/archived buildings.',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDeleted?: boolean = false;
}
