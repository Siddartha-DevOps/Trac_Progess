import { IsString, IsOptional, IsInt, Min, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DashboardQueryDto {
  @ApiProperty({ description: 'Filter by organization ID', required: false, example: 'org-123' })
  @IsString()
  @IsOptional()
  organizationId?: string;

  @ApiProperty({ description: 'Filter by project ID', required: false, example: 'proj-123' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ description: 'Start date for temporal analytics', required: false, example: '2026-01-01' })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({ description: 'End date for temporal analytics', required: false, example: '2026-12-31' })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({ description: 'Filter by building ID', required: false, example: 'build-456' })
  @IsString()
  @IsOptional()
  buildingId?: string;

  @ApiProperty({ description: 'Filter by specific trade', required: false, example: 'MEP' })
  @IsString()
  @IsOptional()
  trade?: string;
}
