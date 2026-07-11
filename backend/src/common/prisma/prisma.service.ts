import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    this.logger.log('Initializing PostgreSQL database connection...');
    try {
      await this.$connect();
      this.logger.log('Database connection successfully established.');
    } catch (error) {
      this.logger.error('Database connection failed to initialize:', error);
    }
  }

  async onModuleDestroy() {
    this.logger.log('Gracefully closing PostgreSQL database connection...');
    await this.$disconnect();
    this.logger.log('Database connection disconnected.');
  }
}
