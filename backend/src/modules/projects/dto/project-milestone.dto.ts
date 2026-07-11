import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, Length, IsDateString, IsIn } from 'class-validator';

export class CreateProjectMilestoneDto {
  @ApiProperty({
    description: 'The title of the timeline milestone or key task.',
    example: 'Completion of 3rd Floor Rebar Mesh Placement',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Milestone title is required.' })
  @Length(3, 100, { message: 'Milestone title must be between 3 and 100 characters.' })
  title: string;

  @ApiPropertyOptional({
    description: 'A detailed summary of quality parameters or execution notes.',
    example: 'Verify slab leveling coordinates and 3D point cloud synchronization via drone.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @ApiProperty({
    description: 'Target baseline due date for milestone completion.',
    example: '2026-09-30T18:30:00.000Z',
  })
  @IsDateString({}, { message: 'dueDate must be a valid ISO8601 date string.' })
  @IsNotEmpty({ message: 'dueDate is required.' })
  dueDate: string;

  @ApiPropertyOptional({
    description: 'The execution state status of this milestone.',
    example: 'PENDING',
    enum: ['PENDING', 'COMPLETED', 'OVERDUE', 'ON_HOLD'],
    default: 'PENDING',
  })
  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'COMPLETED', 'OVERDUE', 'ON_HOLD'])
  status?: string = 'PENDING';
}

export class UpdateProjectMilestoneDto {
  @ApiPropertyOptional({
    description: 'Revised title of the milestone.',
    example: 'Pouring Concrete - Slab Tower B Level 3',
  })
  @IsString()
  @IsOptional()
  @Length(3, 100)
  title?: string;

  @ApiPropertyOptional({
    description: 'Revised description or notes.',
  })
  @IsString()
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @ApiPropertyOptional({
    description: 'Revised estimated due date.',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Updated state status of the milestone.',
    example: 'COMPLETED',
    enum: ['PENDING', 'COMPLETED', 'OVERDUE', 'ON_HOLD'],
  })
  @IsString()
  @IsOptional()
  @IsIn(['PENDING', 'COMPLETED', 'OVERDUE', 'ON_HOLD'])
  status?: string;
}

export class ProjectMilestoneResponseDto {
  @ApiProperty({ description: 'Unique milestone GUID.' })
  id: string;

  @ApiProperty({ description: 'Title.' })
  title: string;

  @ApiPropertyOptional({ description: 'Description.' })
  description?: string;

  @ApiProperty({ description: 'Target due date.' })
  dueDate: Date;

  @ApiProperty({ description: 'Current status.', example: 'PENDING' })
  status: string;

  @ApiProperty({ description: 'The parent project ID.' })
  projectId: string;

  @ApiProperty({ description: 'Creation timestamp.' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp.' })
  updatedAt: Date;
}
