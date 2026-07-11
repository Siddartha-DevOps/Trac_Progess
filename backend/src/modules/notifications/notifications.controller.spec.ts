import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TriggerNotificationDto, NotificationChannel } from './dto/trigger-notification.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('NotificationsController Unit Tests', () => {
  let controller: NotificationsController;
  let service: NotificationsService;

  const mockTemplate = {
    id: 'tpl-123',
    name: 'PROGRESS_ALERT',
    subject: 'Progress Alert: {{projectName}}',
    body: 'Project is updated.',
    channels: 'EMAIL',
  };

  const mockLog = {
    id: 'log-123',
    recipient: 'test@email.com',
    channel: 'EMAIL',
    subject: 'Subject',
    body: 'Body',
    status: 'SENT',
  };

  beforeEach(async () => {
    const mockNotificationsService = {
      createTemplate: jest.fn().mockResolvedValue(mockTemplate),
      getTemplateById: jest.fn().mockResolvedValue(mockTemplate),
      getTemplates: jest.fn().mockResolvedValue([mockTemplate]),
      updateTemplate: jest.fn().mockResolvedValue(mockTemplate),
      deleteTemplate: jest.fn().mockResolvedValue({ success: true }),
      triggerNotification: jest.fn().mockResolvedValue({
        success: true,
        channelsTriggered: ['EMAIL'],
        logs: [mockLog],
      }),
      retryFailedNotifications: jest.fn().mockResolvedValue({
        message: 'Retry sweeping complete.',
        stats: { totalProcessed: 1, retriesSucceeded: 1, retriesFailed: 0 },
      }),
      getLogs: jest.fn().mockResolvedValue({ items: [mockLog], total: 1 }),
      getLogById: jest.fn().mockResolvedValue(mockLog),
    };

    const mockPrismaService = {};

    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<NotificationsController>(NotificationsController);
    service = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('triggerNotification', () => {
    it('should invoke triggerNotification with TriggerNotificationDto', async () => {
      const dto: TriggerNotificationDto = {
        projectId: 'proj-123',
        recipient: 'test@email.com',
        channels: [NotificationChannel.EMAIL],
        templateName: 'PROGRESS_ALERT',
        variables: { projectName: 'Tech Park' },
      };

      const result = await controller.triggerNotification(dto, { headers: { 'x-user-id': 'user-1' } });
      expect(result.success).toBe(true);
      expect(service.triggerNotification).toHaveBeenCalledWith(dto, 'user-1');
    });
  });

  describe('retryFailedNotifications', () => {
    it('should execute the background retry worker sweep task', async () => {
      const result = await controller.retryFailedNotifications();
      expect(result.stats.retriesSucceeded).toBe(1);
      expect(service.retryFailedNotifications).toHaveBeenCalled();
    });
  });

  describe('createTemplate', () => {
    it('should create and register a new template entity', async () => {
      const dto: CreateTemplateDto = {
        name: 'DELAY_WARNING',
        subject: 'Delay Alert',
        body: 'Alert message',
        channels: 'EMAIL,SMS',
      };

      const result = await controller.createTemplate(dto, { headers: { 'x-user-id': 'user-1' } });
      expect(result).toEqual(mockTemplate);
      expect(service.createTemplate).toHaveBeenCalledWith(dto, 'user-1');
    });
  });

  describe('getLogs', () => {
    it('should query and filter historical log telemetry', async () => {
      const result = await controller.getLogs({ page: 1, limit: 10 });
      expect(result.items).toContainEqual(mockLog);
      expect(service.getLogs).toHaveBeenCalled();
    });
  });
});
