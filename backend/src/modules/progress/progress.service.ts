import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProgressRepository } from './progress.repository';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProgressDto, CreateSnapshotDto } from './dto/create-progress.dto';
import { QueryProgressDto } from './dto/query-progress.dto';

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(
    private readonly repo: ProgressRepository,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async createProgressRecord(dto: CreateProgressDto, userId?: string) {
    this.logger.log(`Recording progress for item: ${dto.itemName} in Project ${dto.projectId}`);

    // Verify project exists
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${dto.projectId} does not exist.`);
    }

    // Verify building if provided
    if (dto.buildingId) {
      const building = await this.prisma.building.findUnique({
        where: { id: dto.buildingId },
      });
      if (!building) {
        throw new NotFoundException(`Building with ID ${dto.buildingId} does not exist.`);
      }
    }

    // Verify floor if provided
    if (dto.floorId) {
      const floor = await this.prisma.floor.findUnique({
        where: { id: dto.floorId },
      });
      if (!floor) {
        throw new NotFoundException(`Floor with ID ${dto.floorId} does not exist.`);
      }
    }

    // Verify room if provided
    if (dto.roomId) {
      const room = await this.prisma.room.findUnique({
        where: { id: dto.roomId },
      });
      if (!room) {
        throw new NotFoundException(`Room with ID ${dto.roomId} does not exist.`);
      }
    }

    const record = await this.repo.createProgressRecord(dto);

    // Write RERA timeline audit trail log
    await this.audit.log({
      action: 'INSERT',
      tableName: 'ProgressRecord',
      recordId: record.id,
      newValues: record,
      userId,
      organizationId: project.organizationId,
    });

    // Create automatic snapshot update for historical analytics
    await this.triggerAutoSnapshot(dto.projectId, dto.buildingId);

    return record;
  }

  async updateProgressRecord(id: string, dto: Partial<CreateProgressDto>, userId?: string) {
    this.logger.log(`Updating progress record: ${id}`);

    const existing = await this.repo.findProgressRecordById(id);
    if (!existing) {
      throw new NotFoundException(`Progress record with ID ${id} not found.`);
    }

    if (dto.installedQuantity !== undefined && dto.totalQuantity !== undefined) {
      if (dto.installedQuantity > dto.totalQuantity) {
        throw new BadRequestException('Installed quantity cannot exceed total planned quantity.');
      }
    } else if (dto.installedQuantity !== undefined) {
      if (dto.installedQuantity > existing.totalQuantity) {
        throw new BadRequestException('Installed quantity cannot exceed total planned quantity.');
      }
    }

    const updated = await this.repo.updateProgressRecord(id, dto);

    // Audit log
    await this.audit.log({
      action: 'UPDATE',
      tableName: 'ProgressRecord',
      recordId: id,
      oldValues: existing,
      newValues: updated,
      userId,
      organizationId: existing.project.organizationId,
    });

    // Create automatic snapshot update for historical analytics
    await this.triggerAutoSnapshot(existing.projectId, existing.buildingId || undefined);

    return updated;
  }

  async getProgressRecordById(id: string) {
    const record = await this.repo.findProgressRecordById(id);
    if (!record) {
      throw new NotFoundException(`Progress record with ID ${id} not found.`);
    }
    return record;
  }

  async getProgressRecords(query: QueryProgressDto) {
    return this.repo.findProgressRecords(query);
  }

  // S-Curve and snapshot queries
  async getProjectSnapshots(projectId: string, buildingId?: string) {
    return this.repo.getProgressSnapshots(projectId, buildingId);
  }

  async createSnapshotManual(dto: CreateSnapshotDto, userId?: string) {
    const snapshot = await this.repo.createProgressSnapshot(dto);
    
    const project = await this.prisma.project.findUnique({
      where: { id: dto.projectId },
    });

    if (project) {
      await this.audit.log({
        action: 'INSERT',
        tableName: 'ProgressSnapshot',
        recordId: snapshot.id,
        newValues: snapshot,
        userId,
        organizationId: project.organizationId,
      });
    }

    return snapshot;
  }

  // Dynamic hierarchical aggregates (Building, Floor, Room, Trade)
  async getAggregatedProgress(projectId: string, buildingId?: string, floorId?: string, roomId?: string) {
    // If we specify a room, we calculate room progress
    // If we specify a floor, we calculate floor progress
    // If we specify a building, we calculate building progress
    // Otherwise, we calculate overall project progress
    
    return this.repo.aggregateProgressByFilter({
      projectId,
      buildingId,
      floorId,
      roomId,
    });
  }

  // Trigger S-Curve automatic snapshots upon changes
  private async triggerAutoSnapshot(projectId: string, buildingId?: string) {
    try {
      const aggregates = await this.repo.aggregateProgressByFilter({ projectId, buildingId });
      
      const snapshots = await this.repo.getProgressSnapshots(projectId, buildingId);
      
      let paceWeeklyDelta = 0.0;
      if (snapshots.length > 0) {
        const lastSnapshot = snapshots[snapshots.length - 1];
        paceWeeklyDelta = aggregates.completionPercent - lastSnapshot.completedPercent;
      }

      await this.repo.createProgressSnapshot({
        projectId,
        buildingId,
        completedPercent: aggregates.completionPercent,
        plannedPercent: aggregates.plannedProgress,
        laborHoursUsed: aggregates.laborHoursPaid,
        paceWeeklyDelta,
      });
    } catch (e) {
      this.logger.error(`Failed to trigger auto snapshot: ${e.message}`, e.stack);
    }
  }
}
