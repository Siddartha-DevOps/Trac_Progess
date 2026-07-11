import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportDto } from './dto/query-report.dto';

@Injectable()
export class ReportsRepository {
  private readonly logger = new Logger(ReportsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async createReport(dto: CreateReportDto, reportData: any, summary?: string, filePath?: string) {
    return this.prisma.report.create({
      data: {
        projectId: dto.projectId,
        name: dto.name,
        type: dto.type,
        format: dto.format,
        status: 'READY', // Immediately ready for high performance
        summary,
        filePath,
        reportData: reportData || {},
      },
      include: {
        project: true,
      },
    });
  }

  async updateReportStatus(id: string, status: string, filePath?: string, summary?: string) {
    return this.prisma.report.update({
      where: { id },
      data: {
        status,
        ...(filePath && { filePath }),
        ...(summary && { summary }),
      },
    });
  }

  async findReportById(id: string) {
    return this.prisma.report.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });
  }

  async findReports(query: QueryReportDto) {
    const { projectId, type, format, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (type) where.type = type;
    if (format) where.format = format;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: true,
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async deleteReport(id: string) {
    return this.prisma.report.delete({
      where: { id },
    });
  }
}
