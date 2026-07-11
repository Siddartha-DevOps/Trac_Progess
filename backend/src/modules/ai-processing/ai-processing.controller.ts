import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { AiProcessingService } from './ai-processing.service';
import { CreateAiJobDto } from './dto/create-ai-job.dto';
import { QueryAiJobDto } from './dto/query-ai-job.dto';
import {
  AiJobResponseDto,
  PaginatedAiJobResponseDto,
  QueueMetricsResponseDto,
} from './dto/ai-job-response.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';

@ApiTags('AI Processing Module')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('ai-processing')
export class AiProcessingController {
  constructor(private readonly aiService: AiProcessingService) {}

  @Post('jobs')
  @Permissions('video.update')
  @ApiOperation({ summary: 'Enqueue a new background AI workload' })
  @ApiResponse({ status: HttpStatus.CREATED, type: AiJobResponseDto })
  async create(@Body() createDto: CreateAiJobDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.aiService.createJob(createDto, userId);
  }

  @Get('jobs')
  @Permissions('video.read')
  @ApiOperation({ summary: 'Query and list background AI jobs with filtering' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedAiJobResponseDto })
  async findAll(@Query() query: QueryAiJobDto) {
    return this.aiService.listJobs(query);
  }

  @Get('metrics')
  @Permissions('video.read')
  @ApiOperation({ summary: 'Retrieve active BullMQ queue, job status, and GPU hardware metrics' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Optional project GUID to filter metrics' })
  @ApiResponse({ status: HttpStatus.OK, type: QueueMetricsResponseDto })
  async getMetrics(@Query('projectId') projectId?: string) {
    return this.aiService.getQueueMetrics(projectId);
  }

  @Get('jobs/:id')
  @Permissions('video.read')
  @ApiOperation({ summary: 'Fetch single AI job progress and hardware statistics' })
  @ApiParam({ name: 'id', description: 'Unique target AI job identifier (UUID v4)' })
  @ApiResponse({ status: HttpStatus.OK, type: AiJobResponseDto })
  async findOne(@Param('id') id: string) {
    return this.aiService.getJobById(id);
  }

  @Post('jobs/:id/retry')
  @HttpCode(HttpStatus.OK)
  @Permissions('video.update')
  @ApiOperation({ summary: 'Manually retry a failed or stalled background job' })
  @ApiParam({ name: 'id', description: 'Unique target AI job identifier (UUID v4)' })
  @ApiResponse({ status: HttpStatus.OK, type: AiJobResponseDto })
  async retry(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.aiService.retryJob(id, userId);
  }

  @Get('jobs/:id/logs')
  @Permissions('video.read')
  @ApiOperation({ summary: 'Fetch live worker processing execution logs' })
  @ApiParam({ name: 'id', description: 'Unique target AI job identifier (UUID v4)' })
  @ApiResponse({
    status: HttpStatus.OK,
    schema: {
      type: 'object',
      properties: {
        jobId: { type: 'string', example: 'j1b2c3d4-e5f6-7a8b-9c0d-0123456789de' },
        jobType: { type: 'string', example: 'FRAME_EXTRACTION' },
        status: { type: 'string', example: 'PROCESSING' },
        logs: {
          type: 'array',
          items: { type: 'string' },
          example: [
            '[2026-07-10T10:30:00Z] Worker: Opening input video stream...',
            '[2026-07-10T10:30:02Z] Worker: Decoded 150/1200 frames.',
          ],
        },
      },
    },
  })
  async getLogs(@Param('id') id: string) {
    return this.aiService.getJobLogs(id);
  }
}
