import { Module } from '@nestjs/common';
import { VideosController } from './videos.controller';
import { VideosService } from './videos.service';
import { VideosRepository } from './videos.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [VideosController],
  providers: [
    VideosService,
    VideosRepository,
    PrismaService,
    AuditService,
  ],
  exports: [VideosService, VideosRepository],
})
export class VideosModule {}
