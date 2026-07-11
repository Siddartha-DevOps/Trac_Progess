import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsRepository } from './reports.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [ReportsController],
  providers: [
    ReportsService,
    ReportsRepository,
    PrismaService,
    AuditService,
  ],
  exports: [ReportsService, ReportsRepository],
})
export class ReportsModule {}
