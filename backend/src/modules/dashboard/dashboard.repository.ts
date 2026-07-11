import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  private readonly logger = new Logger(DashboardRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async getOrganizationProjectsSummary(organizationId: string) {
    const projects = await this.prisma.project.findMany({
      where: { organizationId, deletedAt: null },
      include: {
        milestones: true,
        buildings: {
          include: {
            progressSnapshots: {
              orderBy: { capturedAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });
    return projects;
  }

  async getProjectHealthMetrics(projectId: string) {
    const [project, milestones, snapshots, progressRecords] = await Promise.all([
      this.prisma.project.findUnique({
        where: { id: projectId },
        include: { _count: { select: { members: true, files: true } } },
      }),
      this.prisma.projectMilestone.findMany({
        where: { projectId },
      }),
      this.prisma.progressSnapshot.findMany({
        where: { projectId },
        orderBy: { capturedAt: 'desc' },
        take: 15,
      }),
      this.prisma.progressRecord.findMany({
        where: { projectId },
      }),
    ]);

    return {
      project,
      milestones,
      snapshots,
      progressRecords,
    };
  }

  async getProgressSnapshots(projectId: string, startDate?: string, endDate?: string) {
    const where: any = { projectId };
    if (startDate || endDate) {
      where.capturedAt = {};
      if (startDate) where.capturedAt.gte = new Date(startDate);
      if (endDate) where.capturedAt.lte = new Date(endDate);
    }

    return this.prisma.progressSnapshot.findMany({
      where,
      orderBy: { capturedAt: 'asc' },
    });
  }

  async getProgressRecords(projectId: string, buildingId?: string, trade?: string) {
    const where: any = { projectId };
    if (buildingId) where.buildingId = buildingId;
    if (trade) where.trade = trade;

    return this.prisma.progressRecord.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
    });
  }

  async getRecentActivities(projectId: string) {
    const [aiJobs, reports, logs] = await Promise.all([
      this.prisma.aiJob.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.report.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      this.prisma.notificationLog.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      aiJobs,
      reports,
      logs,
    };
  }
}
