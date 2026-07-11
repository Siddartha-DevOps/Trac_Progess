import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsBoolean, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryOrganizationDto {
  @ApiPropertyOptional({
    description: 'A search term matching name, slug, or reraLicense of the organization.',
    example: 'Toubro',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'The zero-indexed page number for offset pagination.',
    example: 1,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Maximum number of items per page.',
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
    description: 'Toggle to include soft-deleted records in the results (Administrators only).',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDeleted?: boolean = false;

  @ApiPropertyOptional({
    description: 'Filter records created on or after this ISO date.',
    example: '2026-01-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  createdAtStart?: string;

  @ApiPropertyOptional({
    description: 'Filter records created on or before this ISO date.',
    example: '2026-12-31T23:59:59.999Z',
  })
  @IsDateString()
  @IsOptional()
  createdAtEnd?: string;
}
