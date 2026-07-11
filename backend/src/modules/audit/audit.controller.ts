import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiHeader } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';

@ApiTags('Audit Module')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-user-id',
  description: 'Simulated User ID for dev testing',
  required: false,
})
@ApiHeader({
  name: 'x-user-role',
  description: 'Simulated User Role',
  required: false,
})
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get('logs')
  @Permissions('read:audit')
  @ApiOperation({ summary: 'Query paginated core audit log entries across all database entities' })
  @ApiResponse({ status: 200, description: 'Succeeded in compiling audit logs list.' })
  async getLogs(@Query() query: AuditQueryDto) {
    return this.service.getLogs(query);
  }

  @Get('logs/:id')
  @Permissions('read:audit')
  @ApiOperation({ summary: 'Retrieve details of a specific database change record' })
  @ApiParam({ name: 'id', description: 'Audit log UUID string' })
  async getLogById(@Param('id') id: string) {
    return this.service.getLogById(id);
  }

  @Get('users')
  @Permissions('read:audit')
  @ApiOperation({ summary: 'Retrieve specialized user administration, roles, and login activity logs' })
  async getUserActivities(@Query() query: AuditQueryDto) {
    return this.service.getUserActivities(query);
  }

  @Get('projects/:projectId')
  @Permissions('read:audit')
  @ApiOperation({ summary: 'Retrieve specialized construction project modifications and object state events' })
  @ApiParam({ name: 'projectId', description: 'Project UUID string' })
  async getProjectActivities(@Param('projectId') projectId: string, @Query() query: AuditQueryDto) {
    return this.service.getProjectActivities(projectId, query);
  }

  @Get('ai')
  @Permissions('read:audit')
  @ApiOperation({ summary: 'Retrieve computer vision / AI job pipeline logs and tracking alerts' })
  async getAiActivities(@Query() query: AuditQueryDto) {
    return this.service.getAiActivities(query);
  }

  @Get('reports')
  @Permissions('read:audit')
  @ApiOperation({ summary: 'Retrieve quality audit & S-Curve report generation log trials' })
  async getReportActivities(@Query() query: AuditQueryDto) {
    return this.service.getReportActivities(query);
  }

  @Get('history/:tableName/:recordId')
  @Permissions('read:audit')
  @ApiOperation({ summary: 'Compile chronologically sorted revision snapshots for a specific record' })
  @ApiParam({ name: 'tableName', description: 'Table name e.g., Project, Room, Building' })
  @ApiParam({ name: 'recordId', description: 'Unique identifier of the record' })
  async getHistory(@Param('tableName') tableName: string, @Param('recordId') recordId: string) {
    return this.service.getHistory(tableName, recordId);
  }

  @Post('restore/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:audit')
  @ApiOperation({ summary: 'Restore record back to its exact JSON state defined in specified historical log' })
  @ApiParam({ name: 'id', description: 'Audit log UUID to restore from' })
  @ApiResponse({ status: 200, description: 'Successfully reverted database record to previous checkpoint.' })
  async restoreLog(@Param('id') id: string, @Req() req: any) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.restoreLog(id, userId);
  }
}
