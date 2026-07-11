import { IsString, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ReportType, ReportFormat } from './create-report.dto';

export class QueryReportDto {
  @ApiProperty({ description: 'Filter by Project ID', required: false })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ description: 'Filter by Report Type', enum: ReportType, required: false })
  @IsEnum(ReportType)
  @IsOptional()
  type?: ReportType;

  @ApiProperty({ description: 'Filter by Output Format', enum: ReportFormat, required: false })
  @IsEnum(ReportFormat)
  @IsOptional()
  format?: ReportFormat;

  @ApiProperty({ description: 'Filter by Generation Status', required: false, example: 'READY' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Page index for pagination', required: false, default: 1 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Result batch limits', required: false, default: 10 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;
}
