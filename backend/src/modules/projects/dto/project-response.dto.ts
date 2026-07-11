import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectMemberResponseDto } from './project-member.dto';
import { ProjectFileResponseDto } from './project-file.dto';
import { ProjectMilestoneResponseDto } from './project-milestone.dto';

export class ProjectResponseDto {
  @ApiProperty({
    description: 'Unique project identifier (UUID v4).',
    example: 'd1b2c3d4-e5f6-7a8b-9c0d-111122223333',
  })
  id: string;

  @ApiProperty({
    description: 'Project title/name.',
    example: 'Bangalore Tech Park Phase 2',
  })
  name: string;

  @ApiPropertyOptional({
    description: 'A detailed description of the project.',
    example: 'Development of tower B concrete slab foundations.',
  })
  description?: string;

  @ApiProperty({
    description: 'Current execution state status.',
    example: 'ACTIVE',
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Baseline start date.',
    example: '2026-07-15T00:00:00.000Z',
  })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Baseline completion date.',
    example: '2027-12-31T00:00:00.000Z',
  })
  endDate?: Date;

  @ApiProperty({
    description: 'Financial budget allocated.',
    example: 7500000.0,
  })
  budget: number;

  @ApiProperty({
    description: 'The parent organization ID.',
    example: 'e2b3c4d5-f6a7-8b9c-0d1e-222233334444',
  })
  organizationId: string;

  @ApiProperty({
    description: 'Registration timestamp.',
    example: '2026-07-10T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp.',
    example: '2026-07-10T12:30:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Soft-delete deactivation timestamp.',
  })
  deletedAt?: Date;

  @ApiPropertyOptional({
    description: 'Associated project members list.',
    type: [ProjectMemberResponseDto],
  })
  members?: ProjectMemberResponseDto[];

  @ApiPropertyOptional({
    description: 'Associated project files list.',
    type: [ProjectFileResponseDto],
  })
  files?: ProjectFileResponseDto[];

  @ApiPropertyOptional({
    description: 'Associated timeline milestones.',
    type: [ProjectMilestoneResponseDto],
  })
  milestones?: ProjectMilestoneResponseDto[];
}

export class ProjectPaginationMetaDto {
  @ApiProperty({ description: 'Total quantity of records matching parameters.', example: 10 })
  totalItems: number;

  @ApiProperty({ description: 'Total records returned in current batch page.', example: 10 })
  itemCount: number;

  @ApiProperty({ description: 'Item count displayed per page.', example: 10 })
  itemsPerPage: number;

  @ApiProperty({ description: 'Total computed pages.', example: 1 })
  totalPages: number;

  @ApiProperty({ description: 'Current active page index (1-indexed).', example: 1 })
  currentPage: number;
}

export class PaginatedProjectResponseDto {
  @ApiProperty({ type: [ProjectResponseDto] })
  items: ProjectResponseDto[];

  @ApiProperty({ type: ProjectPaginationMetaDto })
  meta: ProjectPaginationMetaDto;
}
