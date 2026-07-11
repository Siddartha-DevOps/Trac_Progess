import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoomsRepository {
  private readonly logger = new Logger(RoomsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async createRoom(createDto: CreateRoomDto) {
    this.logger.log(`Inserting new Room into database: ${createDto.name} under Floor ID: ${createDto.floorId}`);
    return this.prisma.room.create({
      data: {
        name: createDto.name.trim(),
        category: createDto.category || 'OFFICE',
        status: createDto.status || 'PLANNING',
        description: createDto.description || null,
        totalArea: createDto.totalArea ?? 0.0,
        height: createDto.height ?? 0.0,
        perimeter: createDto.perimeter ?? 0.0,
        geometry: createDto.geometry !== undefined ? (createDto.geometry as Prisma.InputJsonValue) : Prisma.JsonNull,
        metadata: createDto.metadata !== undefined ? (createDto.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
        floorId: createDto.floorId,
      },
    });
  }

  async updateRoom(id: string, updateDto: UpdateRoomDto) {
    this.logger.log(`Updating Room record with ID: ${id}`);
    return this.prisma.room.update({
      where: { id },
      data: {
        name: updateDto.name !== undefined ? updateDto.name.trim() : undefined,
        category: updateDto.category !== undefined ? updateDto.category : undefined,
        status: updateDto.status !== undefined ? updateDto.status : undefined,
        description: updateDto.description !== undefined ? updateDto.description : undefined,
        totalArea: updateDto.totalArea !== undefined ? updateDto.totalArea : undefined,
        height: updateDto.height !== undefined ? updateDto.height : undefined,
        perimeter: updateDto.perimeter !== undefined ? updateDto.perimeter : undefined,
        geometry: updateDto.geometry !== undefined ? (updateDto.geometry as Prisma.InputJsonValue) : undefined,
        metadata: updateDto.metadata !== undefined ? (updateDto.metadata as Prisma.InputJsonValue) : undefined,
      },
    });
  }

  async findRoomById(id: string, includeDeleted = false) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        floor: {
          select: {
            id: true,
            name: true,
            buildingId: true,
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
        },
      },
    });

    if (room && room.deletedAt && !includeDeleted) {
      return null;
    }

    return room;
  }

  async findRoomByNameAndFloor(name: string, floorId: string, includeDeleted = false) {
    const room = await this.prisma.room.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
        floorId,
      },
    });

    if (room && room.deletedAt && !includeDeleted) {
      return null;
    }

    return room;
  }

  async findAllRooms(queryDto: QueryRoomDto) {
    const { floorId, status, category, search, page = 1, limit = 10, includeDeleted = false } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.RoomWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (floorId) {
      where.floorId = floorId;
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    this.logger.log(`Executing rooms query with filters: ${JSON.stringify(where)}`);

    const [items, totalItems] = await Promise.all([
      this.prisma.room.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          floor: {
            select: {
              id: true,
              name: true,
              buildingId: true,
            },
          },
        },
      }),
      this.prisma.room.count({ where }),
    ]);

    return { items, totalItems };
  }

  async softDeleteRoom(id: string) {
    this.logger.log(`Setting soft-delete timestamp for Room ID: ${id}`);
    return this.prisma.room.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restoreRoom(id: string) {
    this.logger.log(`Restoring soft-deleted Room ID: ${id}`);
    return this.prisma.room.update({
      where: { id },
      data: { deletedAt: null },
    });
  }
}
