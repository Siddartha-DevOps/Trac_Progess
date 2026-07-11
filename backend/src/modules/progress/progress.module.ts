import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ProgressRepository } from './progress.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [ProgressController],
  providers: [
    ProgressService,
    ProgressRepository,
    PrismaService,
    AuditService,
  ],
  exports: [ProgressService, ProgressRepository],
})
export class ProgressModule {}
