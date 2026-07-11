import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, IsInt, Min, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryVideoDto {
  @ApiPropertyOptional({
    description: 'Filter videos by project ID.',
    example: 'proj-111',
  })
  @IsUUID('4', { message: 'Project ID must be a valid UUID.' })
  @IsOptional()
  projectId?: string;

  @ApiPropertyOptional({
    description: 'Filter by 360-degree video format.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  is360?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by upload or processing status.',
    example: 'COMPLETED',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({
    description: 'Search string matching video name or description.',
    example: 'drone',
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
