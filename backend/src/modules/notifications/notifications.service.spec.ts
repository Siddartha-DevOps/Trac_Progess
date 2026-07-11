import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TriggerNotificationDto, NotificationChannel } from './dto/trigger-notification.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('NotificationsService Unit Tests', () => {
  let service: NotificationsService;
  let repo: NotificationsRepository;
  let audit: AuditService;
  let prisma: PrismaService;

  const mockTemplate = {
    id: 'tpl-123',
    name: 'PROGRESS_ALERT',
    subject: 'Progress Alert: {{projectName}}',
    body: 'The project {{projectName}} was updated.',
    channels: 'EMAIL',
  };

  const mockLog = {
    id: 'log-123',
    recipient: 'test@email.com',
    channel: 'EMAIL',
    subject: 'Subject',
    body: 'Body',
    status: 'PENDING',
    retryCount: 0,
  };

  beforeEach(async () => {
    const mockNotificationsRepository = {
      createTemplate: jest.fn().mockResolvedValue(mockTemplate),
      updateTemplate: jest.fn().mockResolvedValue(mockTemplate),
      findTemplateById: jest.fn().mockResolvedValue(mockTemplate),
      findTemplateByName: jest.fn().mockResolvedValue(mockTemplate),
      findTemplates: jest.fn().mockResolvedValue([mockTemplate]),
      deleteTemplate: jest.fn().mockResolvedValue({ success: true }),
      createLogEntry: jest.fn().mockResolvedValue(mockLog),
      updateLogStatus: jest.fn().mockResolvedValue({ ...mockLog, status: 'SENT' }),
      findLogs: jest.fn().mockResolvedValue({ items: [mockLog], total: 1 }),
      findLogById: jest.fn().mockResolvedValue(mockLog),
      findFailedLogsForRetry: jest.fn().mockResolvedValue([
        { ...mockLog, id: 'fail-1', status: 'FAILED', retryCount: 0, recipient: 'fail@email.com' },
      ]),
    };

    const mockAuditService = {
      log: jest.fn().mockResolvedValue({ id: 'audit-123' }),
    };

    const mockPrismaService = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: NotificationsRepository, useValue: mockNotificationsRepository },
        { provide: AuditService, useValue: mockAuditService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    repo = module.get<NotificationsRepository>(NotificationsRepository);
    audit = module.get<AuditService>(AuditService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTemplate', () => {
    it('should throw BadRequestException if template name already exists', async () => {
      const dto: CreateTemplateDto = {
        name: 'PROGRESS_ALERT', // Already exists in mock findTemplateByName
        subject: 'Progress Alert',
        body: 'Alert body',
        channels: 'EMAIL',
      };

      await expect(service.createTemplate(dto, 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should successfully create and audit a template', async () => {
      jest.spyOn(repo, 'findTemplateByName').mockResolvedValueOnce(null);

      const dto: CreateTemplateDto = {
        name: 'NEW_TEMPLATE',
        subject: 'Progress Alert',
        body: 'Alert body',
        channels: 'EMAIL',
      };

      const result = await service.createTemplate(dto, 'user-1');

      expect(result).toBeDefined();
      expect(repo.createTemplate).toHaveBeenCalledWith(dto);
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'INSERT',
          tableName: 'NotificationTemplate',
          userId: 'user-1',
        }),
      );
    });
  });

  describe('triggerNotification', () => {
    it('should perform variable interpolation and dispatch simulated emails successfully', async () => {
      const dto: TriggerNotificationDto = {
        projectId: 'proj-123',
        recipient: 'test@email.com',
        channels: [NotificationChannel.EMAIL],
        templateName: 'PROGRESS_ALERT',
        variables: { projectName: 'Tech Park' },
      };

      const result = await service.triggerNotification(dto, 'user-1');

      expect(result.success).toBe(true);
      expect(repo.createLogEntry).toHaveBeenCalledWith(
        expect.objectContaining({
          recipient: 'test@email.com',
          channel: 'EMAIL',
          subject: 'Progress Alert: Tech Park',
          body: 'The project Tech Park was updated.',
        }),
      );
    });

    it('should gracefully log a failed status if recipient contains a fail indicator', async () => {
      const dto: TriggerNotificationDto = {
        projectId: 'proj-123',
        recipient: 'fail@email.com',
        channels: [NotificationChannel.EMAIL],
        templateName: 'PROGRESS_ALERT',
        variables: { projectName: 'Tech Park' },
      };

      await service.triggerNotification(dto, 'user-1');
      expect(repo.updateLogStatus).toHaveBeenCalledWith(expect.any(String), 'FAILED', 0, expect.any(String));
    });
  });

  describe('retryFailedNotifications', () => {
    it('should process pending failed queues and increment retry counters', async () => {
      const result = await service.retryFailedNotifications(3);

      expect(result.stats.totalProcessed).toBe(1);
      // The recipient was 'fail@email.com' which fails again, so it increments retry count to 1 and stays FAILED
      expect(repo.updateLogStatus).toHaveBeenCalledWith('fail-1', 'FAILED', 1, expect.any(String));
    });
  });
});
