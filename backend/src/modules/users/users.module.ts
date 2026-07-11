import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';
import { AppLogger } from '../../common/logger/app-logger.service';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    PrismaService,
    AuditService,
    AppLogger,
  ],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
