import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum NotificationChannel {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export class TriggerNotificationDto {
  @ApiProperty({ description: 'The project ID associated with this event', required: false, example: 'proj-123' })
  @IsString()
  @IsOptional()
  projectId?: string;

  @ApiProperty({ description: 'Optional recipient User ID to map user preferences', required: false, example: 'user-123' })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'The direct recipient coordinate (email address, mobile number or device push token)', example: 'engineer@buildtrace.in' })
  @IsString()
  @IsNotEmpty()
  recipient: string;

  @ApiProperty({ description: 'Select delivery channels to broadcast', enum: ['EMAIL', 'SMS', 'PUSH', 'IN_APP'], isArray: true, example: ['EMAIL', 'IN_APP'] })
  @IsArray()
  @IsNotEmpty()
  channels: NotificationChannel[];

  @ApiProperty({ description: 'Template system name if using templates', required: false, example: 'PROGRESS_ALERT' })
  @IsString()
  @IsOptional()
  templateName?: string;

  @ApiProperty({ description: 'Manual subject line (ignored if template is used)', required: false, example: 'Urgent: Structural Inspection Needed' })
  @IsString()
  @IsOptional()
  subject?: string;

  @ApiProperty({ description: 'Manual body content (ignored if template is used)', required: false, example: 'Please review floor 3 concrete pouring alignment discrepancy.' })
  @IsString()
  @IsOptional()
  body?: string;

  @ApiProperty({ description: 'Dynamic key-value variables to merge with the template', required: false, example: { projectName: 'Tech Park', delayPercent: '12%' } })
  @IsObject()
  @IsOptional()
  variables?: Record<string, any>;
}
