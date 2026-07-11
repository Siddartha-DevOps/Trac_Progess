import { Module } from '@nestjs/common';
import { AiProcessingController } from './ai-processing.controller';
import { AiProcessingService } from './ai-processing.service';
import { AiProcessingRepository } from './ai-processing.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [AiProcessingController],
  providers: [
    AiProcessingService,
    AiProcessingRepository,
    PrismaService,
    AuditService,
  ],
  exports: [AiProcessingService, AiProcessingRepository],
})
export class AiProcessingModule {}
