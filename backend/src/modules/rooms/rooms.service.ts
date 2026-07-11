import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { RoomsRepository } from './rooms.repository';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    private readonly repo: RoomsRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createRoom(createDto: CreateRoomDto, userId?: string) {
    this.logger.log(`Handling create room request: ${createDto.name}`);

    // Verify parent floor level exists
    const floor = await this.prisma.floor.findUnique({
      where: { id: createDto.floorId, deletedAt: null },
      include: {
        building: {
          select: {
            id: true,
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

    if (!floor) {
      throw new NotFoundException(`Parent Floor Level ID '${createDto.floorId}' was not found or is soft-deleted.`);
    }

    // Verify uniqueness of room name within the parent floor level
    const existingRoom = await this.repo.findRoomByNameAndFloor(createDto.name, createDto.floorId);
    if (existingRoom) {
      throw new ConflictException(`Room designation '${createDto.name}' already exists on Floor ID '${createDto.floorId}'.`);
    }

    const room = await this.repo.createRoom(createDto);

    // Audit Log entry creation
    await this.audit.log({
      action: 'INSERT',
      tableName: 'Room',
      recordId: room.id,
      newValues: room,
      userId,
      organizationId: floor.building?.project?.organizationId,
    });

    return room;
  }

  async updateRoom(id: string, updateDto: UpdateRoomDto, userId?: string) {
    this.logger.log(`Handling update room request for ID: ${id}`);

    const existingRoom = await this.repo.findRoomById(id);
    if (!existingRoom) {
      throw new NotFoundException(`Room with ID '${id}' was not found.`);
    }

    // If room name is changing, check for uniqueness in same floor
    if (updateDto.name && updateDto.name.trim().toLowerCase() !== existingRoom.name.toLowerCase()) {
      const duplicate = await this.repo.findRoomByNameAndFloor(updateDto.name, existingRoom.floorId);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException(`Room designation '${updateDto.name}' already exists on the same Floor Level.`);
      }
    }

    const updated = await this.repo.updateRoom(id, updateDto);

    // Audit Log entry update
    await this.audit.log({
      action: 'UPDATE',
      tableName: 'Room',
      recordId: id,
      newValues: updated,
      userId,
      organizationId: existingRoom.floor?.building?.project?.organizationId,
    });

    return updated;
  }

  async findRoomById(id: string) {
    this.logger.log(`Handling fetch single room request for ID: ${id}`);
    const room = await this.repo.findRoomById(id);
    if (!room) {
      throw new NotFoundException(`Room with ID '${id}' was not found.`);
    }
    return room;
  }

  async findAllRooms(query: QueryRoomDto) {
    this.logger.log(`Handling fetch all rooms request with filters: ${JSON.stringify(query)}`);
    const { items, totalItems } = await this.repo.findAllRooms(query);
    const totalPages = Math.ceil(totalItems / (query.limit || 10));

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: query.limit || 10,
        totalPages,
        currentPage: query.page || 1,
      },
    };
  }

  async softDeleteRoom(id: string, userId?: string) {
    this.logger.log(`Handling soft-delete room request for ID: ${id}`);
    const room = await this.repo.findRoomById(id);
    if (!room) {
      throw new NotFoundException(`Room with ID '${id}' was not found.`);
    }

    const deleted = await this.repo.softDeleteRoom(id);

    // Audit Log entry deletion
    await this.audit.log({
      action: 'DELETE',
      tableName: 'Room',
      recordId: id,
      newValues: deleted,
      userId,
      organizationId: room.floor?.building?.project?.organizationId,
    });

    return deleted;
  }

  async restoreRoom(id: string, userId?: string) {
    this.logger.log(`Handling restore soft-deleted room request for ID: ${id}`);
    const room = await this.repo.findRoomById(id, true);
    if (!room) {
      throw new NotFoundException(`Room with ID '${id}' was not found.`);
    }

    const restored = await this.repo.restoreRoom(id);

    // Audit Log entry restoration
    await this.audit.log({
      action: 'RESTORE',
      tableName: 'Room',
      recordId: id,
      newValues: restored,
      userId,
      organizationId: room.floor?.building?.project?.organizationId,
    });

    return restored;
  }
}
