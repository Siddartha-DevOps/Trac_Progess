import { Module } from '@nestjs/common';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { OrganizationsRepository } from './organizations.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { AppLogger } from '../../common/logger/app-logger.service';

@Module({
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService,
    OrganizationsRepository,
    PrismaService,
    AuditService,
    AppLogger,
  ],
  exports: [OrganizationsService, OrganizationsRepository],
})
export class OrganizationsModule {}
