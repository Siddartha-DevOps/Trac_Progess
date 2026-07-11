import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { CreateProgressDto, CreateSnapshotDto } from './dto/create-progress.dto';
import { QueryProgressDto } from './dto/query-progress.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';

@ApiTags('Progress Engine Module')
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
@Controller('progress')
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('write:progress')
  @ApiOperation({ summary: 'Record physical progress update for an item/trade element' })
  @ApiResponse({ status: 201, description: 'Progress record registered and logged successfully' })
  async createProgressRecord(@Body() dto: CreateProgressDto, @Req() req: any) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.createProgressRecord(dto, userId);
  }

  @Patch(':id')
  @Permissions('write:progress')
  @ApiOperation({ summary: 'Modify an existing progress record (actual quantities installed)' })
  @ApiParam({ name: 'id', description: 'Progress Record UUID' })
  @ApiResponse({ status: 200, description: 'Progress record modified, audited, and committed' })
  async updateProgressRecord(
    @Param('id') id: string,
    @Body() dto: Partial<CreateProgressDto>,
    @Req() req: any,
  ) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.updateProgressRecord(id, dto, userId);
  }

  @Get('snapshots')
  @Permissions('read:progress')
  @ApiOperation({ summary: 'Fetch S-curve historical completion snapshots for analytics' })
  @ApiQuery({ name: 'projectId', description: 'Project ID filter', required: true })
  @ApiQuery({ name: 'buildingId', description: 'Building ID filter', required: false })
  async getProjectSnapshots(
    @Query('projectId') projectId: string,
    @Query('buildingId') buildingId?: string,
  ) {
    return this.service.getProjectSnapshots(projectId, buildingId);
  }

  @Post('snapshots')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('write:progress')
  @ApiOperation({ summary: 'Create manual baseline/historical snapshot for S-Curve calculation' })
  async createSnapshotManual(@Body() dto: CreateSnapshotDto, @Req() req: any) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.createSnapshotManual(dto, userId);
  }

  @Get('aggregates')
  @Permissions('read:progress')
  @ApiOperation({ summary: 'Query high-fidelity progress calculations dynamically aggregated' })
  @ApiQuery({ name: 'projectId', description: 'Project ID filter', required: true })
  @ApiQuery({ name: 'buildingId', description: 'Building ID filter', required: false })
  @ApiQuery({ name: 'floorId', description: 'Floor ID filter', required: false })
  @ApiQuery({ name: 'roomId', description: 'Room ID filter', required: false })
  async getAggregatedProgress(
    @Query('projectId') projectId: string,
    @Query('buildingId') buildingId?: string,
    @Query('floorId') floorId?: string,
    @Query('roomId') roomId?: string,
  ) {
    return this.service.getAggregatedProgress(projectId, buildingId, floorId, roomId);
  }

  @Get(':id')
  @Permissions('read:progress')
  @ApiOperation({ summary: 'Get details of a specific progress record' })
  @ApiParam({ name: 'id', description: 'Progress Record UUID' })
  async getProgressRecordById(@Param('id') id: string) {
    return this.service.getProgressRecordById(id);
  }

  @Get()
  @Permissions('read:progress')
  @ApiOperation({ summary: 'Search and filter recorded progress entries' })
  async getProgressRecords(@Query() query: QueryProgressDto) {
    return this.service.getProgressRecords(query);
  }
}
