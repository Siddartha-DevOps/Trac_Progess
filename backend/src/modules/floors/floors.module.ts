import { Module } from '@nestjs/common';
import { FloorsController } from './floors.controller';
import { FloorsService } from './floors.service';
import { FloorsRepository } from './floors.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [FloorsController],
  providers: [
    FloorsService,
    FloorsRepository,
    PrismaService,
    AuditService,
  ],
  exports: [FloorsService, FloorsRepository],
})
export class FloorsModule {}
