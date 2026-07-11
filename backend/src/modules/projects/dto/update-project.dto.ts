import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, Length, IsNumber, Min, IsDateString, IsIn } from 'class-validator';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Updated name of the project.',
    example: 'Bangalore Tech Park Tower B foundation',
  })
  @IsString()
  @IsOptional()
  @Length(3, 100)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated descriptive explanation of the project.',
    example: 'Focusing exclusively on Zone B level 3 structural rebar works.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Updated state status of the project.',
    example: 'ACTIVE',
    enum: ['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['PLANNING', 'ACTIVE', 'ON_HOLD', 'COMPLETED', 'ARCHIVED'])
  status?: string;

  @ApiPropertyOptional({
    description: 'Updated project mobilization start date.',
    example: '2026-08-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Updated project completion date.',
    example: '2028-06-30T00:00:00.000Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Revised budget allocated to the project.',
    example: 8200000.0,
  })
  @IsNumber()
  @Min(0)
  @IsOptional()
  budget?: number;
}
