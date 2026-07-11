import { IsString, IsNotEmpty, IsEnum, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ReportType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  PROGRESS = 'PROGRESS',
  DELAY = 'DELAY',
  EXECUTIVE = 'EXECUTIVE',
}

export enum ReportFormat {
  PDF = 'PDF',
  EXCEL = 'EXCEL',
  JSON = 'JSON',
}

export class CreateReportDto {
  @ApiProperty({ description: 'Unique Project ID to run the report on', example: 'proj-123' })
  @IsString()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ description: 'A custom user-defined name for this report', example: 'Q3 Structural Audit' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Type of report', enum: ReportType, example: 'PROGRESS' })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({ description: 'Output document format', enum: ReportFormat, example: 'PDF' })
  @IsEnum(ReportFormat)
  format: ReportFormat;

  @ApiProperty({ description: 'Additional filters (buildingId, floorId, dateRange etc)', required: false })
  @IsObject()
  @IsOptional()
  filters?: Record<string, any>;
}
