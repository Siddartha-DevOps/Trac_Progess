import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryBimModelDto {
  @ApiPropertyOptional({
    description: 'Filter models belonging to a specific Project ID.',
    example: 'proj-111',
  })
  @IsUUID('4', { message: 'Project ID must be a valid UUID.' })
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Filter models by format type (IFC or RVT).',
    example: 'IFC',
  })
  @IsString()
  @IsOptional()
  fileType?: string;

  @ApiPropertyOptional({
    description: 'Filter models by processing status.',
    example: 'COMPLETED',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Search string matching name or description.',
    example: 'structural',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'The pagination page index (1-based).',
    example: 1,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'The number of records per page.',
    example: 10,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
