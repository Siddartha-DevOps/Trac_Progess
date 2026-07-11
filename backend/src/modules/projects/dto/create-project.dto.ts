import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Length, IsUUID, IsNumber, Min, IsDateString } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'The unique corporate name of the construction or site project.',
    example: 'Bangalore Tech Park Phase 2',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Project name cannot be empty.' })
  @Length(3, 100, { message: 'Project name must be between 3 and 100 characters.' })
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the construction scope, area, and objectives.',
    example: 'Development of tower B concrete slab foundations and core shell fitouts.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500, { message: 'Description cannot exceed 500 characters.' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Current baseline status of the project lifecyle.',
    example: 'PLANNING',
    enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'],
    default: 'PLANNING',
  })
  @IsString()
  @IsOptional()
  status?: string = 'PLANNING';

  @ApiPropertyOptional({
    description: 'Project baseline mobilization/start date.',
    example: '2026-07-15T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'startDate must be a valid ISO8601 date string.' })
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Project baseline estimated completion/end date.',
    example: '2027-12-31T00:00:00.000Z',
  })
  @IsDateString({}, { message: 'endDate must be a valid ISO8601 date string.' })
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Estimated financial budget in Indian Rupees (INR) or localized standard currency.',
    example: 7500000.0,
    default: 0.0,
  })
  @IsNumber({}, { message: 'budget must be a valid float value.' })
  @Min(0, { message: 'budget cannot be negative.' })
  @IsOptional()
  budget?: number = 0.0;

  @ApiProperty({
    description: 'The unique organization ID (UUID v4) owning this project.',
    example: 'e2b3c4d5-f6a7-8b9c-0d1e-222233334444',
  })
  @IsUUID('4', { message: 'organizationId must be a valid UUID v4.' })
  @IsNotEmpty({ message: 'organizationId is required.' })
  organizationId: string;
}
