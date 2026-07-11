import { ApiProperty } from '@nestjs/swagger';

export class ProjectStatusBreakdownDto {
  @ApiProperty({ description: 'Total milestones in PENDING status.', example: 5 })
  pending: number;

  @ApiProperty({ description: 'Total milestones in COMPLETED status.', example: 8 })
  completed: number;

  @ApiProperty({ description: 'Total milestones in OVERDUE status.', example: 2 })
  overdue: number;

  @ApiProperty({ description: 'Total milestones in ON_HOLD status.', example: 1 })
  onHold: number;
}

export class ProjectAnalyticsResponseDto {
  @ApiProperty({ description: 'The parent project ID.' })
  projectId: string;

  @ApiProperty({ description: 'The project name.' })
  projectName: string;

  @ApiProperty({ description: 'The current status of the project.', example: 'ACTIVE' })
  status: string;

  @ApiProperty({ description: 'Assigned member count.', example: 12 })
  totalMembers: number;

  @ApiProperty({ description: 'Uploaded file count.', example: 34 })
  totalFiles: number;

  @ApiProperty({ description: 'Total milestones in the project timeline.', example: 16 })
  totalMilestones: number;

  @ApiProperty({ description: 'Overall milestone completion rate percentage.', example: 50.0 })
  completionRate: number;

  @ApiProperty({ description: 'Allocated project budget.', example: 10000000 })
  budget: number;

  @ApiProperty({ type: ProjectStatusBreakdownDto })
  milestoneBreakdown: ProjectStatusBreakdownDto;

  @ApiProperty({ description: 'Project timeline days remaining before target endDate.', example: 145 })
  daysRemaining: number;

  @ApiProperty({ description: 'Progress health status rating based on milestones and timelines.', example: 'On Track' })
  healthStatus: string;
}

export class ProjectDashboardResponseDto {
  @ApiProperty({ description: 'Total active projects.', example: 4 })
  activeProjects: number;

  @ApiProperty({ description: 'Total planning phase projects.', example: 2 })
  planningProjects: number;

  @ApiProperty({ description: 'Total completed projects.', example: 1 })
  completedProjects: number;

  @ApiProperty({ description: 'Total project count in the organization.', example: 7 })
  totalProjects: number;

  @ApiProperty({ description: 'Cumulative budget of all projects.', example: 54000000 })
  cumulativeBudget: number;

  @ApiProperty({ description: 'Top projects sorted by timeline risk or progress density.' })
  projectSummaries: {
    id: string;
    name: string;
    status: string;
    completionRate: number;
    milestoneCount: number;
    memberCount: number;
  }[];
}
