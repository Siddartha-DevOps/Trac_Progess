import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [DashboardController],
  providers: [
    DashboardService,
    DashboardRepository,
    PrismaService,
    AuditService,
  ],
  exports: [DashboardService, DashboardRepository],
})
export class DashboardModule {}
