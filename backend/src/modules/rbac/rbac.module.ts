import { Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { RbacRepository } from './rbac.repository';
import { PrismaService } from '../../common/prisma/prisma.service';

@Module({
  controllers: [RbacController],
  providers: [RbacService, RbacRepository, PrismaService],
  exports: [RbacService, RbacRepository],
})
export class RbacModule {}
