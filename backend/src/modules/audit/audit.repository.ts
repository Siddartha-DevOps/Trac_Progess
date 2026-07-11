import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditQueryDto } from './dto/audit-query.dto';

@Injectable()
export class AuditRepository {
  private readonly logger = new Logger(AuditRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: AuditQueryDto) {
    const where = this.buildWhereClause(query);
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              role: true,
            },
          },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    const log = await this.prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
    if (!log) {
      throw new NotFoundException(`Audit log with ID ${id} not found.`);
    }
    return log;
  }

  async findHistory(tableName: string, recordId: string) {
    return this.prisma.auditLog.findMany({
      where: { tableName, recordId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAiJobs(query: AuditQueryDto) {
    const where: any = {};
    if (query.projectId) where.projectId = query.projectId;
    if (query.action) where.status = query.action; // Match action to status in AI jobs
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.aiJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.aiJob.count({ where }),
    ]);

    return { items, total };
  }

  async findReports(query: AuditQueryDto) {
    const where: any = {};
    if (query.projectId) where.projectId = query.projectId;
    if (query.action) where.status = query.action;
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.report.count({ where }),
    ]);

    return { items, total };
  }

  /**
   * Dynamically applies audit state back to the specified DB table.
   * Leverages Prisma client's dynamic model access.
   */
  async restoreState(tableName: string, recordId: string, state: any): Promise<any> {
    const modelName = this.mapTableToPrismaModel(tableName);
    const prismaModel = (this.prisma as any)[modelName];

    if (!prismaModel) {
      throw new BadRequestException(`Table '${tableName}' is not supported for automated state restoration.`);
    }

    this.logger.log(`Executing database-level restoration for ${tableName} [ID: ${recordId}]`);

    // Clean state fields that shouldn't be overridden or cause unique constraint violations
    const sanitizedState = { ...state };
    delete sanitizedState.id;
    delete sanitizedState.createdAt;
    delete sanitizedState.updatedAt;

    try {
      // Upsert record back into its destination table
      return await prismaModel.upsert({
        where: { id: recordId },
        update: sanitizedState,
        create: {
          id: recordId,
          ...sanitizedState,
        },
      });
    } catch (error) {
      this.logger.error(`Dynamic restoration failed for ${tableName} ID ${recordId}:`, error);
      throw new BadRequestException(`Restoration failed due to schema constraint violations: ${error.message}`);
    }
  }

  private buildWhereClause(query: AuditQueryDto) {
    const where: any = {};

    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }
    if (query.tableName) {
      where.tableName = { equals: query.tableName, mode: 'insensitive' };
    }
    if (query.recordId) {
      where.recordId = query.recordId;
    }
    if (query.action) {
      where.action = { equals: query.action, mode: 'insensitive' };
    }
    if (query.userId) {
      where.userId = query.userId;
    }
    if (query.projectId) {
      // Filter logs of items belonging to this project
      where.OR = [
        { recordId: query.projectId, tableName: 'Project' },
        { oldValues: { path: 'projectId', equals: query.projectId } },
        { newValues: { path: 'projectId', equals: query.projectId } },
      ];
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    return where;
  }

  private mapTableToPrismaModel(tableName: string): string {
    const mappings: { [key: string]: string } = {
      'organization': 'organization',
      'user': 'user',
      'role': 'role',
      'project': 'project',
      'projectmember': 'projectMember',
      'projectfile': 'projectFile',
      'projectmilestone': 'projectMilestone',
      'building': 'building',
      'floor': 'floor',
      'room': 'room',
      'bimmodel': 'bimModel',
      'bimelement': 'bimElement',
      'video': 'video',
      'aijob': 'aiJob',
      'progressrecord': 'progressRecord',
      'progresssnapshot': 'progressSnapshot',
      'report': 'report',
      'notificationtemplate': 'notificationTemplate',
      'notificationlog': 'notificationLog',
    };

    const normalized = tableName.toLowerCase().replace(/[^a-z]/g, '');
    return mappings[normalized] || '';
  }
}
