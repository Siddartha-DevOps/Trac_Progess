import { IsString, IsOptional, IsInt, Min, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AuditQueryDto {
  @ApiProperty({ description: 'Filter by organization ID', required: false })
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiProperty({ description: 'Filter by table name', required: false, example: 'Project' })
  @IsString()
  @IsOptional()
  tableName?: string;

  @ApiProperty({ description: 'Filter by specific record ID', required: false })
  @IsString()
  @IsOptional()
  recordId?: string;

  @ApiProperty({ description: 'Filter by action type (INSERT, UPDATE, DELETE, RESTORE)', required: false, example: 'UPDATE' })
  @IsString()
  @IsOptional()
  action?: string;

  @ApiProperty({ description: 'Filter by user ID who made the change', required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Filter by project ID', required: false })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ description: 'Start date for temporal filtering', required: false, example: '2026-01-01T00:00:00.000Z' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'End date for temporal filtering', required: false, example: '2026-12-31T23:59:59.999Z' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: 'Pagination limit', required: false, default: 20 })
  @IsInt()
  @Min(1)
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @ApiProperty({ description: 'Pagination offset', required: false, default: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  offset?: number = 0;
}
