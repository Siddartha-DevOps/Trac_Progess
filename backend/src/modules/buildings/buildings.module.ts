import { Module } from '@nestjs/common';
import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';
import { BuildingsRepository } from './buildings.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [BuildingsController],
  providers: [
    BuildingsService,
    BuildingsRepository,
    PrismaService,
    AuditService,
  ],
  exports: [BuildingsService, BuildingsRepository],
})
export class BuildingsModule {}
