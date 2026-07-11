import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface AuditLogPayload {
  action: 'INSERT' | 'UPDATE' | 'DELETE' | 'RESTORE';
  tableName: string;
  recordId: string;
  oldValues?: any;
  newValues?: any;
  userId?: string;
  organizationId?: string;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(payload: AuditLogPayload): Promise<void> {
    try {
      this.logger.log(`Recording Audit Log: ${payload.action} on ${payload.tableName} [ID: ${payload.recordId}]`);
      
      // Attempt to save to database
      await this.prisma.auditLog.create({
        data: {
          action: payload.action,
          tableName: payload.tableName,
          recordId: payload.recordId,
          oldValues: payload.oldValues ? JSON.parse(JSON.stringify(payload.oldValues)) : null,
          newValues: payload.newValues ? JSON.parse(JSON.stringify(payload.newValues)) : null,
          userId: payload.userId || null,
          organizationId: payload.organizationId || null,
        },
      });
    } catch (error) {
      // Graceful fallback to prevent disrupting client requests if audit database suffers transient failures
      this.logger.error(`Failed to write database audit record for ${payload.tableName}:`, error);
    }
  }
}
