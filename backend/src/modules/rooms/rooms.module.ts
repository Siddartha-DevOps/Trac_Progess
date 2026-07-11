import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomsRepository } from './rooms.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [RoomsController],
  providers: [
    RoomsService,
    RoomsRepository,
    PrismaService,
    AuditService,
  ],
  exports: [RoomsService, RoomsRepository],
})
export class RoomsModule {}
