import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { QueryFloorDto } from './dto/query-floor.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FloorsRepository {
  private readonly logger = new Logger(FloorsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async createFloor(createDto: CreateFloorDto) {
    this.logger.log(`Inserting new Floor into database: ${createDto.name} (Level: ${createDto.number}, Order: ${createDto.order})`);
    return this.prisma.floor.create({
      data: {
        name: createDto.name.trim(),
        description: createDto.description || null,
        number: createDto.number,
        order: createDto.order,
        totalArea: createDto.totalArea ?? 0.0,
        status: createDto.status || 'PLANNING',
        metadata: createDto.metadata !== undefined ? (createDto.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
        buildingId: createDto.buildingId,
      },
    });
  }

  async updateFloor(id: string, updateDto: UpdateFloorDto) {
    this.logger.log(`Updating Floor record with ID: ${id}`);
    return this.prisma.floor.update({
      where: { id },
      data: {
        name: updateDto.name !== undefined ? updateDto.name.trim() : undefined,
        description: updateDto.description !== undefined ? updateDto.description : undefined,
        number: updateDto.number !== undefined ? updateDto.number : undefined,
        order: updateDto.order !== undefined ? updateDto.order : undefined,
        totalArea: updateDto.totalArea !== undefined ? updateDto.totalArea : undefined,
        status: updateDto.status !== undefined ? updateDto.status : undefined,
        metadata: updateDto.metadata !== undefined ? (updateDto.metadata as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async findFloorById(id: string, includeDeleted = false) {
    const floor = await this.prisma.floor.findUnique({
      where: { id },
      include: {
        building: {
          select: {
            id: true,
            name: true,
            projectId: true,
            project: {
              select: {
                id: true,
                organizationId: true,
              },
            },
          },
        },
      },
    });

    if (floor && floor.deletedAt && !includeDeleted) {
      return null;
    }

    return floor;
  }

  async findFloorByLevelNumberAndBuilding(number: number, buildingId: string, includeDeleted = false) {
    const floor = await this.prisma.floor.findFirst({
      where: {
        number,
        buildingId,
      },
    });

    if (floor && floor.deletedAt && !includeDeleted) {
      return null;
    }

    return floor;
  }

  async findFloorByNameAndBuilding(name: string, buildingId: string, includeDeleted = false) {
    const floor = await this.prisma.floor.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
        buildingId,
      },
    });

    if (floor && floor.deletedAt && !includeDeleted) {
      return null;
    }

    return floor;
  }

  async findAllFloors(queryDto: QueryFloorDto) {
    const { buildingId, status, search, page = 1, limit = 10, includeDeleted = false } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.FloorWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (buildingId) {
      where.buildingId = buildingId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    this.logger.log(`Executing floors query with filters: ${JSON.stringify(where)}`);

    const [items, totalItems] = await Promise.all([
      this.prisma.floor.findMany({
        where,
        skip,
        take: limit,
        orderBy: { order: 'asc' }, // Order by structural/sequencing order index
        include: {
          building: {
            select: {
              id: true,
              name: true,
              projectId: true,
            },
          },
        },
      }),
      this.prisma.floor.count({ where }),
    ]);

    return { items, totalItems };
  }

  async softDeleteFloor(id: string) {
    this.logger.log(`Setting soft-delete timestamp for Floor ID: ${id}`);
    return this.prisma.floor.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restoreFloor(id: string) {
    this.logger.log(`Restoring soft-deleted Floor ID: ${id}`);
    return this.prisma.floor.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async updateFloorsOrder(orderedIds: string[]) {
    this.logger.log(`Re-ordering floors: ${JSON.stringify(orderedIds)}`);
    
    // Execute sequential updates in a transaction
    return this.prisma.$transaction(
      orderedIds.map((id, index) =>
        this.prisma.floor.update({
          where: { id },
          data: { order: index },
        }),
      ),
    );
  }
}
