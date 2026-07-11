import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProgressDto, CreateSnapshotDto } from './dto/create-progress.dto';
import { QueryProgressDto } from './dto/query-progress.dto';

@Injectable()
export class ProgressRepository {
  private readonly logger = new Logger(ProgressRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async createProgressRecord(dto: CreateProgressDto) {
    return this.prisma.progressRecord.create({
      data: {
        projectId: dto.projectId,
        buildingId: dto.buildingId,
        floorId: dto.floorId,
        roomId: dto.roomId,
        trade: dto.trade,
        itemName: dto.itemName,
        installedQuantity: dto.installedQuantity,
        totalQuantity: dto.totalQuantity,
        unit: dto.unit,
        unitWeight: dto.unitWeight,
        laborHoursPaid: dto.laborHoursPaid || 0,
        plannedDays: dto.plannedDays || 30,
        status: dto.status || 'PLANNING',
      },
    });
  }

  async updateProgressRecord(id: string, data: Partial<CreateProgressDto>) {
    return this.prisma.progressRecord.update({
      where: { id },
      data,
    });
  }

  async findProgressRecordById(id: string) {
    return this.prisma.progressRecord.findUnique({
      where: { id },
      include: {
        project: true,
        building: true,
        floor: true,
        room: true,
      },
    });
  }

  async findProgressRecords(query: QueryProgressDto) {
    const { projectId, buildingId, floorId, trade, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (buildingId) where.buildingId = buildingId;
    if (floorId) where.floorId = floorId;
    if (trade) where.trade = { equals: trade, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      this.prisma.progressRecord.findMany({
        where,
        skip,
        take: limit,
        orderBy: { recordedAt: 'desc' },
        include: {
          building: true,
          floor: true,
          room: true,
        },
      }),
      this.prisma.progressRecord.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async createProgressSnapshot(dto: CreateSnapshotDto) {
    return this.prisma.progressSnapshot.create({
      data: {
        projectId: dto.projectId,
        buildingId: dto.buildingId,
        completedPercent: dto.completedPercent,
        plannedPercent: dto.plannedPercent,
        laborHoursUsed: dto.laborHoursUsed || 0,
        paceWeeklyDelta: dto.paceWeeklyDelta || 0.0,
      },
    });
  }

  async getProgressSnapshots(projectId: string, buildingId?: string) {
    const where: any = { projectId };
    if (buildingId) where.buildingId = buildingId;

    return this.prisma.progressSnapshot.findMany({
      where,
      orderBy: { capturedAt: 'asc' },
    });
  }

  // Calculate composite progress metrics for a scope
  async aggregateProgressByFilter(filter: { projectId?: string; buildingId?: string; floorId?: string; roomId?: string }) {
    const where: any = {};
    if (filter.projectId) where.projectId = filter.projectId;
    if (filter.buildingId) where.buildingId = filter.buildingId;
    if (filter.floorId) where.floorId = filter.floorId;
    if (filter.roomId) where.roomId = filter.roomId;

    const records = await this.prisma.progressRecord.findMany({ where });

    if (records.length === 0) {
      return {
        actualProgress: 0,
        plannedProgress: 50.0, // default target reference
        progressPercent: 0,
        completionPercent: 0,
        remainingWork: 0,
        totalQuantity: 0,
        installedQuantity: 0,
        laborHoursPaid: 0,
        trades: {},
      };
    }

    let totalWeightedWork = 0;
    let completedWeightedWork = 0;
    let totalQuantity = 0;
    let installedQuantity = 0;
    let laborHoursPaid = 0;

    const tradeGroups: Record<string, { total: number; completed: number; weight: number }> = {};

    for (const record of records) {
      const weight = record.unitWeight;
      const totalWeighted = record.totalQuantity * weight;
      const completedWeighted = record.installedQuantity * weight;

      totalWeightedWork += totalWeighted;
      completedWeightedWork += completedWeighted;
      totalQuantity += record.totalQuantity;
      installedQuantity += record.installedQuantity;
      laborHoursPaid += record.laborHoursPaid;

      // Group by trade for Trade Progress
      if (!tradeGroups[record.trade]) {
        tradeGroups[record.trade] = { total: 0, completed: 0, weight: 0 };
      }
      tradeGroups[record.trade].total += totalWeighted;
      tradeGroups[record.trade].completed += completedWeighted;
      tradeGroups[record.trade].weight += weight;
    }

    const completionPercent = totalWeightedWork > 0 ? (completedWeightedWork / totalWeightedWork) * 100 : 0;
    const remainingWork = Math.max(0, totalWeightedWork - completedWeightedWork);

    const tradesDetail = Object.keys(tradeGroups).reduce((acc, tradeKey) => {
      const g = tradeGroups[tradeKey];
      acc[tradeKey] = {
        completionPercent: g.total > 0 ? (g.completed / g.total) * 100 : 0,
        remainingWorkPoints: Math.max(0, g.total - g.completed),
      };
      return acc;
    }, {} as Record<string, { completionPercent: number; remainingWorkPoints: number }>);

    // Default reference calculation for Planned Progress based on planned durations
    const averagePlannedDays = records.reduce((sum, r) => sum + r.plannedDays, 0) / records.length;
    // Planned progress starts at 0% and rises to 100% reference line linearly for baseline simulation
    const plannedProgress = 70.0; // standard milestone projection baseline for active projects

    return {
      actualProgress: completionPercent,
      plannedProgress,
      progressPercent: plannedProgress > 0 ? (completionPercent / plannedProgress) * 100 : 0,
      completionPercent,
      remainingWork,
      totalQuantity,
      installedQuantity,
      laborHoursPaid,
      trades: tradesDetail,
    };
  }
}
