import { Injectable, Logger, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TriggerNotificationDto, NotificationChannel } from './dto/trigger-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly repo: NotificationsRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // Automatically seed default templates if they do not exist
  async onModuleInit() {
    this.logger.log('Initializing Notifications templates and background engine.');
    try {
      await this.seedDefaultTemplates();
    } catch (e) {
      this.logger.error('Failed to seed default notification templates:', e);
    }
  }

  private async seedDefaultTemplates() {
    const defaultTemplates: CreateTemplateDto[] = [
      {
        name: 'PROGRESS_ALERT',
        subject: 'Progress Alert: {{projectName}} - {{trade}} Status Update',
        body: 'Dear Team, physical progress update has been registered for project "{{projectName}}". Current complete trade volume for {{trade}} stands at {{completionPercent}}% with {{remainingWork}} units remaining.',
        channels: 'EMAIL,IN_APP',
      },
      {
        name: 'DELAY_WARNING',
        subject: 'CRITICAL DELAY ALERT: {{projectName}} Risk Score {{riskScore}}/100',
        body: 'URGENT: Project "{{projectName}}" is pacing below baseline schedule targets. Actual Completion is {{actualProgress}}% vs Planned {{plannedProgress}}% (Delta: {{variance}}%). Active delay mitigation recommended.',
        channels: 'EMAIL,SMS,PUSH,IN_APP',
      },
      {
        name: 'REPORT_READY',
        subject: 'Report Ready: BuildTrace Audit Document Generated',
        body: 'The requested "{{reportType}}" audit report ("{{reportName}}") for project "{{projectName}}" has been successfully compiled and is ready for download. Format: {{format}}.',
        channels: 'EMAIL,IN_APP',
      },
    ];

    for (const t of defaultTemplates) {
      const existing = await this.repo.findTemplateByName(t.name);
      if (!existing) {
        await this.repo.createTemplate(t);
        this.logger.log(`Seeded default notification template: ${t.name}`);
      }
    }
  }

  // ==========================================
  // TEMPLATES CRUD
  // ==========================================

  async createTemplate(dto: CreateTemplateDto, userId?: string) {
    const existing = await this.repo.findTemplateByName(dto.name);
    if (existing) {
      throw new BadRequestException(`Template with name "${dto.name}" already exists.`);
    }

    const template = await this.repo.createTemplate(dto);

    // Audit Log
    await this.audit.log({
      action: 'INSERT',
      tableName: 'NotificationTemplate',
      recordId: template.id,
      newValues: template,
      userId,
    });

    return template;
  }

  async getTemplateById(id: string) {
    const template = await this.repo.findTemplateById(id);
    if (!template) {
      throw new NotFoundException(`Template with ID ${id} not found.`);
    }
    return template;
  }

  async getTemplates() {
    return this.repo.findTemplates();
  }

  async updateTemplate(id: string, dto: Partial<CreateTemplateDto>, userId?: string) {
    const existing = await this.repo.findTemplateById(id);
    if (!existing) {
      throw new NotFoundException(`Template with ID ${id} not found.`);
    }

    const template = await this.repo.updateTemplate(id, dto);

    await this.audit.log({
      action: 'UPDATE',
      tableName: 'NotificationTemplate',
      recordId: id,
      newValues: template,
      userId,
    });

    return template;
  }

  async deleteTemplate(id: string, userId?: string) {
    const existing = await this.repo.findTemplateById(id);
    if (!existing) {
      throw new NotFoundException(`Template with ID ${id} not found.`);
    }

    await this.repo.deleteTemplate(id);

    await this.audit.log({
      action: 'DELETE',
      tableName: 'NotificationTemplate',
      recordId: id,
      oldValues: existing,
      userId,
    });

    return { success: true };
  }

  // ==========================================
  // DISPATCH & TRIGGER SERVICES
  // ==========================================

  async triggerNotification(dto: TriggerNotificationDto, userId?: string) {
    this.logger.log(`Triggering notifications for recipient: ${dto.recipient}`);

    let finalSubject = dto.subject || 'BuildTrace India System Update';
    let finalBody = dto.body || 'No message content defined.';
    const variables = dto.variables || {};

    // 1. If templateName is supplied, load and interpolate variables
    if (dto.templateName) {
      const template = await this.repo.findTemplateByName(dto.templateName);
      if (!template) {
        throw new NotFoundException(`Notification template "${dto.templateName}" not found.`);
      }
      finalSubject = this.interpolate(template.subject, variables);
      finalBody = this.interpolate(template.body, variables);
    }

    const createdLogs = [];

    // 2. Loop and dispatch across requested channels (creates distinct dispatch logs)
    for (const channel of dto.channels) {
      // Create pending log entry (Simulates enqueueing)
      const log = await this.repo.createLogEntry({
        projectId: dto.projectId,
        userId: dto.userId || userId,
        recipient: dto.recipient,
        channel,
        templateName: dto.templateName,
        subject: finalSubject,
        body: finalBody,
        status: 'PENDING',
        metadata: variables,
      });

      // Synchronously execute immediate simulated dispatch
      const outcome = await this.dispatchSimulatedNotification(channel, dto.recipient, finalSubject, finalBody);

      if (outcome.success) {
        const updated = await this.repo.updateLogStatus(log.id, 'SENT', 0);
        createdLogs.push(updated);
      } else {
        const updated = await this.repo.updateLogStatus(log.id, 'FAILED', 0, outcome.error);
        createdLogs.push(updated);
      }
    }

    return {
      success: true,
      channelsTriggered: dto.channels,
      logs: createdLogs,
    };
  }

  // Helper method to interpolate values
  private interpolate(text: string, variables: Record<string, any>): string {
    if (!text) return '';
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  // Simulated Hardware gateway dispatchers (supports Fail tests)
  private async dispatchSimulatedNotification(
    channel: NotificationChannel,
    recipient: string,
    subject: string,
    body: string,
  ): Promise<{ success: boolean; error?: string }> {
    // Inject custom fail triggers to test robust retry engines
    if (recipient.toLowerCase().includes('fail') || body.toLowerCase().includes('simulate_error')) {
      return {
        success: false,
        error: `Simulated Gateway Timeout for channel ${channel} on recipient: ${recipient}`,
      };
    }

    // Simulate real network delay/jitter
    await new Promise((resolve) => setTimeout(resolve, 50));

    switch (channel) {
      case NotificationChannel.EMAIL:
        this.logger.log(`[SMTP-MOCK] Mail successfully delivered to <${recipient}> with subject "${subject}"`);
        break;
      case NotificationChannel.SMS:
        this.logger.log(`[SMS-GATEWAY-MOCK] SMS text message sent to "${recipient}": "${body.substring(0, 40)}..."`);
        break;
      case NotificationChannel.PUSH:
        this.logger.log(`[APNS-FCM-MOCK] Push notification triggered on client token "${recipient}": "${subject}"`);
        break;
      case NotificationChannel.IN_APP:
        this.logger.log(`[WEBSOCKET-MOCK] In-app notification card painted for recipient: ${recipient}`);
        break;
    }

    return { success: true };
  }

  // ==========================================
  // RETRY BACKGROUND ENGINE (Simulated Queue Worker)
  // ==========================================

  async retryFailedNotifications(maxRetries: number = 3) {
    this.logger.log('Running background retry sweeper queue task...');
    const failedLogs = await this.repo.findFailedLogsForRetry(maxRetries);
    
    const stats = {
      totalProcessed: failedLogs.length,
      retriesSucceeded: 0,
      retriesFailed: 0,
    };

    for (const log of failedLogs) {
      const nextRetryCount = log.retryCount + 1;
      this.logger.log(`Retrying log ID ${log.id} (Channel: ${log.channel}, Attempt: ${nextRetryCount})`);

      const outcome = await this.dispatchSimulatedNotification(
        log.channel as NotificationChannel,
        log.recipient,
        log.subject || '',
        log.body,
      );

      if (outcome.success) {
        await this.repo.updateLogStatus(log.id, 'SENT', nextRetryCount, null);
        stats.retriesSucceeded++;
      } else {
        const isFinalFailure = nextRetryCount >= maxRetries;
        const finalStatus = isFinalFailure ? 'FAILED_MAX_RETRIES' : 'FAILED';
        await this.repo.updateLogStatus(log.id, finalStatus, nextRetryCount, outcome.error);
        stats.retriesFailed++;
      }
    }

    return {
      message: 'Retry sweeping complete.',
      stats,
    };
  }

  async getLogs(query: QueryNotificationDto) {
    return this.repo.findLogs(query);
  }

  async getLogById(id: string) {
    const log = await this.repo.findLogById(id);
    if (!log) {
      throw new NotFoundException(`Notification log with ID ${id} not found.`);
    }
    return log;
  }
}
