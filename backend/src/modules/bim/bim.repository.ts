import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBimModelDto } from './dto/create-bim-model.dto';
import { UpdateBimModelDto } from './dto/update-bim-model.dto';
import { QueryBimModelDto } from './dto/query-bim-model.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BimRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createModel(createDto: CreateBimModelDto, versionNumber: number) {
    return this.prisma.bimModel.create({
      data: {
        name: createDto.name.trim(),
        description: createDto.description,
        fileUrl: createDto.fileUrl,
        fileType: createDto.fileType,
        version: versionNumber,
        status: 'PROCESSING',
        coordinateSystem: createDto.coordinateSystem || Prisma.JsonNull,
        metadata: createDto.metadata || Prisma.JsonNull,
        projectId: createDto.projectId,
      },
    });
  }

  async findModelById(id: string, includeElements = false, includeDeleted = false) {
    return this.prisma.bimModel.findFirst({
      where: { id, deletedAt: includeDeleted ? undefined : null },
      include: {
        elements: includeElements ? { orderBy: { name: 'asc' } } : false,
        project: true,
      },
    });
  }

  async findLatestVersion(projectId: string, name: string) {
    return this.prisma.bimModel.findFirst({
      where: {
        projectId,
        name: { equals: name.trim(), mode: 'insensitive' },
        deletedAt: null,
      },
      orderBy: { version: 'desc' },
    });
  }

  async updateModel(id: string, updateDto: UpdateBimModelDto) {
    const data: Prisma.BimModelUpdateInput = {};
    if (updateDto.name !== undefined) data.name = updateDto.name.trim();
    if (updateDto.description !== undefined) data.description = updateDto.description;
    if (updateDto.status !== undefined) data.status = updateDto.status;
    if (updateDto.coordinateSystem !== undefined) data.coordinateSystem = updateDto.coordinateSystem;
    if (updateDto.metadata !== undefined) data.metadata = updateDto.metadata;

    return this.prisma.bimModel.update({
      where: { id },
      data,
    });
  }

  async findAllModels(query: QueryBimModelDto) {
    const { projectId, fileType, status, search, page = 1, limit = 10 } = query;
    const where: Prisma.BimModelWhereInput = { deletedAt: null };

    if (projectId) where.projectId = projectId;
    if (fileType) where.fileType = fileType;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, totalItems] = await Promise.all([
      this.prisma.bimModel.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: [{ name: 'asc' }, { version: 'desc' }],
      }),
      this.prisma.bimModel.count({ where }),
    ]);

    return { items, totalItems };
  }

  async softDeleteModel(id: string) {
    return this.prisma.bimModel.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restoreModel(id: string) {
    return this.prisma.bimModel.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async createElements(modelId: string, elements: Array<{
    externalId: string;
    name: string;
    type: string;
    category: string;
    geometry?: any;
    properties?: any;
  }>) {
    // Prisma transaction bulk insert
    return this.prisma.$transaction(
      elements.map(el =>
        this.prisma.bimElement.create({
          data: {
            externalId: el.externalId,
            name: el.name,
            type: el.type,
            category: el.category,
            geometry: el.geometry || Prisma.JsonNull,
            properties: el.properties || Prisma.JsonNull,
            modelId,
          },
        })
      )
    );
  }

  async findElementsByModel(modelId: string) {
    return this.prisma.bimElement.findMany({
      where: { modelId },
      orderBy: { name: 'asc' },
    });
  }
}
