import { Module } from '@nestjs/common';
import { BimController } from './bim.controller';
import { BimService } from './bim.service';
import { BimRepository } from './bim.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [BimController],
  providers: [
    BimService,
    BimRepository,
    PrismaService,
    AuditService,
  ],
  exports: [BimService, BimRepository],
})
export class BimModule {}
