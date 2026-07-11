import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditRepository } from './audit.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService as CommonAuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [AuditController],
  providers: [
    AuditService,
    AuditRepository,
    PrismaService,
    CommonAuditService,
  ],
  exports: [AuditService, AuditRepository],
})
export class AuditModule {}
