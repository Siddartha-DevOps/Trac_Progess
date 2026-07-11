import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiHeader } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';

@ApiTags('Dashboard Module')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-user-id',
  description: 'Simulated User ID for development testing',
  required: false,
})
@ApiHeader({
  name: 'x-user-role',
  description: 'Simulated User Role (Admin, SiteEngineer, Auditor)',
  required: false,
})
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  @Permissions('project.read')
  @ApiOperation({ summary: 'Get high-level dashboard KPIs and project list for organization', description: 'Returns project statuses, cumulative budget, average progress, and a project summary list.' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Organization dashboard summary successfully retrieved.' })
  async getSummary(@Query() query: DashboardQueryDto) {
    const orgId = query.organizationId || 'org-123';
    return this.service.getOrganizationSummary(orgId);
  }

  @Get('project-health/:projectId')
  @Permissions('project.read')
  @ApiOperation({ summary: 'Get extensive project health metrics', description: 'Retrieves health scores, budget variances, active anomalies, and custom site KPI ratios.' })
  @ApiParam({ name: 'projectId', description: 'Unique identifier of the project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Project health telemetry successfully calculated.' })
  async getProjectHealth(@Param('projectId') projectId: string) {
    return this.service.getProjectHealth(projectId);
  }

  @Get('progress/:projectId')
  @Permissions('project.read')
  @ApiOperation({ summary: 'Get progress S-Curve series data', description: 'Lists actual vs planned physical construction volume percentages over successive weeks.' })
  @ApiParam({ name: 'projectId', description: 'Unique identifier of the project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'S-Curve progress metrics compiled successfully.' })
  async getProjectProgress(@Param('projectId') projectId: string, @Query() query: DashboardQueryDto) {
    return this.service.getProjectProgress(projectId, query);
  }

  @Get('delays/:projectId')
  @Permissions('project.read')
  @ApiOperation({ summary: 'Calculate delay predictions & site bottleneck factors', description: 'Leverages AI simulated scheduling risk metrics to identify delayed trades and critical path risks.' })
  @ApiParam({ name: 'projectId', description: 'Unique identifier of the project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Schedule delay predictions completed.' })
  async getProjectDelays(@Param('projectId') projectId: string) {
    return this.service.getProjectDelays(projectId);
  }

  @Get('productivity/:projectId')
  @Permissions('project.read')
  @ApiOperation({ summary: 'Get site labor productivity and EVM metrics', description: 'Calculates EVM factors including Schedule Performance Index (SPI), Cost Performance Index (CPI), and labor ratios.' })
  @ApiParam({ name: 'projectId', description: 'Unique identifier of the project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'EVM and productivity analysis generated.' })
  async getProductivity(@Param('projectId') projectId: string) {
    return this.service.getProductivity(projectId);
  }

  @Get('trades/:projectId')
  @Permissions('project.read')
  @ApiOperation({ summary: 'Get comprehensive physical trade breakdowns', description: 'Aggregates installed quantities and completion rates across all operational trade disciplines.' })
  @ApiParam({ name: 'projectId', description: 'Unique identifier of the project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Trades breakdown completed.' })
  async getTradesSummary(@Param('projectId') projectId: string, @Query() query: DashboardQueryDto) {
    return this.service.getTradesSummary(projectId, query);
  }

  @Get('activities/:projectId')
  @Permissions('project.read')
  @ApiOperation({ summary: 'Retrieve recent construction audit activities feed', description: 'Merges AI vision jobs, compiled reports, and dispatched communications into a unified feed.' })
  @ApiParam({ name: 'projectId', description: 'Unique identifier of the project' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Recent activity log fetched successfully.' })
  async getRecentActivities(@Param('projectId') projectId: string) {
    return this.service.getRecentActivities(projectId);
  }
}
