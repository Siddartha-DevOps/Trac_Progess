import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiHeader } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TriggerNotificationDto } from './dto/trigger-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';

@ApiTags('Notifications Module')
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
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  // ==========================================
  // DISPATCH ENGINE & QUEUES
  // ==========================================

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:notifications')
  @ApiOperation({ summary: 'Trigger broadcast across multiple channels (Email, SMS, Push, In-App)' })
  @ApiResponse({ status: 200, description: 'Broadcasting completed or queued' })
  async triggerNotification(@Body() dto: TriggerNotificationDto, @Req() req: any) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.triggerNotification(dto, userId);
  }

  @Post('retry')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:notifications')
  @ApiOperation({ summary: 'Trigger queue retry sweeper task for failed notification logs' })
  @ApiResponse({ status: 200, description: 'Sweeper completed processing retries' })
  async retryFailedNotifications() {
    return this.service.retryFailedNotifications();
  }

  // ==========================================
  // LOGS & TELEMETRY
  // ==========================================

  @Get('logs')
  @Permissions('read:notifications')
  @ApiOperation({ summary: 'Query paginated dispatch histories and delivery status logs' })
  async getLogs(@Query() query: QueryNotificationDto) {
    return this.service.getLogs(query);
  }

  @Get('logs/:id')
  @Permissions('read:notifications')
  @ApiOperation({ summary: 'Retrieve specific notification log payload metrics' })
  @ApiParam({ name: 'id', description: 'Notification log UUID' })
  async getLogById(@Param('id') id: string) {
    return this.service.getLogById(id);
  }

  // ==========================================
  // TEMPLATES CRUD
  // ==========================================

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  @Permissions('write:notifications')
  @ApiOperation({ summary: 'Create a custom notification template with placeholders' })
  async createTemplate(@Body() dto: CreateTemplateDto, @Req() req: any) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.createTemplate(dto, userId);
  }

  @Get('templates')
  @Permissions('read:notifications')
  @ApiOperation({ summary: 'List all seeded and custom notification templates' })
  async getTemplates() {
    return this.service.getTemplates();
  }

  @Get('templates/:id')
  @Permissions('read:notifications')
  @ApiParam({ name: 'id', description: 'Template UUID' })
  async getTemplateById(@Param('id') id: string) {
    return this.service.getTemplateById(id);
  }

  @Patch('templates/:id')
  @Permissions('write:notifications')
  @ApiParam({ name: 'id', description: 'Template UUID' })
  async updateTemplate(@Param('id') id: string, @Body() dto: Partial<CreateTemplateDto>, @Req() req: any) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.updateTemplate(id, dto, userId);
  }

  @Delete('templates/:id')
  @Permissions('write:notifications')
  @ApiParam({ name: 'id', description: 'Template UUID' })
  async deleteTemplate(@Param('id') id: string, @Req() req: any) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.deleteTemplate(id, userId);
  }
}
