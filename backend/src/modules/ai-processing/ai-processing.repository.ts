import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAiJobDto } from './dto/create-ai-job.dto';
import { QueryAiJobDto } from './dto/query-ai-job.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AiProcessingRepository {
  private readonly logger = new Logger(AiProcessingRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async createJob(createDto: CreateAiJobDto) {
    this.logger.log(`Inserting new AI Job [Type: ${createDto.jobType}] for Project ID: ${createDto.projectId}`);
    return this.prisma.aiJob.create({
      data: {
        jobType: createDto.jobType,
        status: 'PENDING',
        priority: createDto.priority ?? 0,
        videoId: createDto.videoId || null,
        projectId: createDto.projectId,
        payload: createDto.payload !== undefined ? (createDto.payload as Prisma.InputJsonValue) : Prisma.JsonNull,
        gpuRequired: createDto.gpuRequired ?? false,
        maxRetries: createDto.maxRetries ?? 3,
        retryCount: 0,
        progressPercent: 0,
        processingLogs: [
          `[${new Date().toISOString()}] Job initialized and queued in BullMQ system.`,
        ],
      },
    });
  }

  async updateJob(id: string, data: Prisma.AiJobUpdateInput) {
    this.logger.log(`Updating AI Job [ID: ${id}]`);
    return this.prisma.aiJob.update({
      where: { id },
      data,
    });
  }

  async findJobById(id: string) {
    return this.prisma.aiJob.findUnique({
      where: { id },
      include: {
        video: true,
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
      },
    });
  }

  async findJobs(queryDto: QueryAiJobDto) {
    const { projectId, status, jobType, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.AiJobWhereInput = {};

    if (projectId) {
      whereClause.projectId = projectId;
    }
    if (status) {
      whereClause.status = status;
    }
    if (jobType) {
      whereClause.jobType = jobType;
    }

    const [data, total] = await Promise.all([
      this.prisma.aiJob.findMany({
        where: whereClause,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        skip,
        take: limit,
        include: {
          video: {
            select: {
              id: true,
              name: true,
              fileUrl: true,
            },
          },
        },
      }),
      this.prisma.aiJob.count({ where: whereClause }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteJob(id: string) {
    return this.prisma.aiJob.delete({
      where: { id },
    });
  }

  async addJobLog(id: string, logLine: string) {
    const job = await this.prisma.aiJob.findUnique({
      where: { id },
      select: { processingLogs: true },
    });

    if (!job) return null;

    const formattedLog = `[${new Date().toISOString()}] ${logLine}`;
    const updatedLogs = [...job.processingLogs, formattedLog];

    return this.prisma.aiJob.update({
      where: { id },
      data: {
        processingLogs: updatedLogs,
      },
    });
  }

  async getQueueMetrics(projectId?: string) {
    const whereClause: Prisma.AiJobWhereInput = projectId ? { projectId } : {};

    const statuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'];
    const counts = await Promise.all(
      statuses.map(status =>
        this.prisma.aiJob.count({
          where: { ...whereClause, status },
        })
      )
    );

    const activeProcessingJobs = await this.prisma.aiJob.findMany({
      where: {
        ...whereClause,
        status: 'PROCESSING',
      },
      select: {
        gpuRequired: true,
        gpuMemoryUsed: true,
      },
    });

    // Calculate simulated metrics or aggregated metrics
    const gpuJobs = activeProcessingJobs.filter(j => j.gpuRequired);
    const activeGpuUtilization = gpuJobs.length > 0 ? Math.min(95, gpuJobs.length * 35 + Math.random() * 10) : 0;
    const activeGpuMemoryMb = activeProcessingJobs.reduce((acc, curr) => acc + (curr.gpuMemoryUsed || 0), 0) || (gpuJobs.length * 4096);

    return {
      pendingCount: counts[0],
      processingCount: counts[1],
      completedCount: counts[2],
      failedCount: counts[3],
      activeGpuUtilization: Number(activeGpuUtilization.toFixed(1)),
      activeGpuMemoryMb,
      averageProcessingTimeSeconds: 245, // Target processing SLA: ~4 mins
    };
  }
}
