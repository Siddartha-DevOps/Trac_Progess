import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';

@Injectable()
export class NotificationsRepository {
  private readonly logger = new Logger(NotificationsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // TEMPLATES CRUD
  // ==========================================

  async createTemplate(dto: CreateTemplateDto) {
    return this.prisma.notificationTemplate.create({
      data: dto,
    });
  }

  async updateTemplate(id: string, dto: Partial<CreateTemplateDto>) {
    return this.prisma.notificationTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async findTemplateById(id: string) {
    return this.prisma.notificationTemplate.findUnique({
      where: { id },
    });
  }

  async findTemplateByName(name: string) {
    return this.prisma.notificationTemplate.findUnique({
      where: { name },
    });
  }

  async findTemplates() {
    return this.prisma.notificationTemplate.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async deleteTemplate(id: string) {
    return this.prisma.notificationTemplate.delete({
      where: { id },
    });
  }

  // ==========================================
  // NOTIFICATION LOGS & QUEUE METRICS
  // ==========================================

  async createLogEntry(data: {
    projectId?: string;
    userId?: string;
    recipient: string;
    channel: string;
    templateName?: string;
    subject?: string;
    body: string;
    status: string;
    errorMessage?: string;
    metadata?: any;
  }) {
    return this.prisma.notificationLog.create({
      data: {
        projectId: data.projectId,
        userId: data.userId,
        recipient: data.recipient,
        channel: data.channel,
        templateName: data.templateName,
        subject: data.subject,
        body: data.body,
        status: data.status,
        errorMessage: data.errorMessage,
        metadata: data.metadata || {},
      },
    });
  }

  async findLogs(query: QueryNotificationDto) {
    const { channel, status, projectId, userId, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (channel) where.channel = channel;
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;

    const [items, total] = await Promise.all([
      this.prisma.notificationLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notificationLog.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateLogStatus(id: string, status: string, retryCount: number, errorMessage?: string) {
    return this.prisma.notificationLog.update({
      where: { id },
      data: {
        status,
        retryCount,
        ...(errorMessage !== undefined && { errorMessage }),
      },
    });
  }

  async findLogById(id: string) {
    return this.prisma.notificationLog.findUnique({
      where: { id },
    });
  }

  async findFailedLogsForRetry(maxRetries: number = 3) {
    return this.prisma.notificationLog.findMany({
      where: {
        status: 'FAILED',
        retryCount: { lt: maxRetries },
      },
      take: 20,
    });
  }
}
