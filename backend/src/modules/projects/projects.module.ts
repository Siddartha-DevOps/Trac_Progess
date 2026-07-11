import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectsRepository } from './projects.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [ProjectsController],
  providers: [
    ProjectsService,
    ProjectsRepository,
    PrismaService,
    AuditService,
  ],
  exports: [ProjectsService, ProjectsRepository],
})
export class ProjectsModule {}
