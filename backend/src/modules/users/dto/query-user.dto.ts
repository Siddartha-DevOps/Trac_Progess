import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min, Max, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryUserDto {
  @ApiPropertyOptional({
    description: 'Search string matching firstName, lastName, or email addresses.',
    example: 'Arjun',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter search results by exact user role clearance.',
    example: 'SiteEngineer',
  })
  @IsString()
  @IsOptional()
  role?: string;

  @ApiPropertyOptional({
    description: 'Filter users by exact tenant organization GUID.',
    example: 'd9b0488e-67c4-4c4c-83b3-111122223333',
  })
  @IsUUID('4')
  @IsOptional()
  organizationId?: string;

  @ApiPropertyOptional({
    description: 'Filter records by active/suspended account statuses.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Filter records by email verification verification state.',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  isEmailVerified?: boolean;

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
    description: 'Toggle to include soft-deleted users (Administrators only).',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeDeleted?: boolean = false;
}
