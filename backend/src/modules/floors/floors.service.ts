import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { FloorsRepository } from './floors.repository';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { QueryFloorDto } from './dto/query-floor.dto';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FloorsService {
  private readonly logger = new Logger(FloorsService.name);

  constructor(
    private readonly repo: FloorsRepository,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async createFloor(createDto: CreateFloorDto, userId?: string) {
    this.logger.log(`Validating and creating floor: ${createDto.name} for Building ID: ${createDto.buildingId}`);

    // Check building existence
    const building = await this.prisma.building.findUnique({
      where: { id: createDto.buildingId },
    });
    if (!building) {
      throw new NotFoundException(`Building with ID ${createDto.buildingId} does not exist.`);
    }

    // Check duplicate level number in the same building
    const existingLevel = await this.repo.findFloorByLevelNumberAndBuilding(createDto.number, createDto.buildingId);
    if (existingLevel) {
      throw new ConflictException(`Floor level number ${createDto.number} already exists in this building.`);
    }

    // Check duplicate floor name in the same building
    const existingName = await this.repo.findFloorByNameAndBuilding(createDto.name, createDto.buildingId);
    if (existingName) {
      throw new ConflictException(`Floor with name '${createDto.name}' already exists in this building.`);
    }

    const floor = await this.repo.createFloor(createDto);

    // Fetch project to retrieve organizationId for audit log
    const project = await this.prisma.project.findUnique({
      where: { id: building.projectId },
    });

    // Write audit log
    await this.audit.log({
      action: 'INSERT',
      tableName: 'Floor',
      recordId: floor.id,
      newValues: floor,
      userId,
      organizationId: project?.organizationId,
    });

    return floor;
  }

  async updateFloor(id: string, updateDto: UpdateFloorDto, userId?: string) {
    this.logger.log(`Updating floor: ${id}`);

    const floor = await this.repo.findFloorById(id);
    if (!floor) {
      throw new NotFoundException(`Floor with ID ${id} not found.`);
    }

    // Check name uniqueness if updated
    if (updateDto.name && updateDto.name.trim().toLowerCase() !== floor.name.toLowerCase()) {
      const existing = await this.repo.findFloorByNameAndBuilding(updateDto.name, floor.buildingId);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Floor with name '${updateDto.name}' already exists in this building.`);
      }
    }

    // Check level number uniqueness if updated
    if (updateDto.number !== undefined && updateDto.number !== floor.number) {
      const existing = await this.repo.findFloorByLevelNumberAndBuilding(updateDto.number, floor.buildingId);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Floor level number ${updateDto.number} already exists in this building.`);
      }
    }

    const updated = await this.repo.updateFloor(id, updateDto);

    // Retrieve organizationId for audit log
    const projectOrg = floor.building?.project;

    await this.audit.log({
      action: 'UPDATE',
      tableName: 'Floor',
      recordId: id,
      oldValues: floor,
      newValues: updated,
      userId,
      organizationId: projectOrg?.organizationId,
    });

    return updated;
  }

  async findFloorById(id: string, includeDeleted = false) {
    const floor = await this.repo.findFloorById(id, includeDeleted);
    if (!floor) {
      throw new NotFoundException(`Floor with ID ${id} not found.`);
    }
    return floor;
  }

  async findAllFloors(queryDto: QueryFloorDto) {
    return this.repo.findAllFloors(queryDto);
  }

  async softDeleteFloor(id: string, userId?: string) {
    this.logger.log(`Soft deleting floor: ${id}`);

    const floor = await this.repo.findFloorById(id);
    if (!floor) {
      throw new NotFoundException(`Floor with ID ${id} not found.`);
    }

    const deleted = await this.repo.softDeleteFloor(id);

    // Retrieve organizationId for audit log
    const projectOrg = floor.building?.project;

    await this.audit.log({
      action: 'DELETE',
      tableName: 'Floor',
      recordId: id,
      oldValues: floor,
      newValues: deleted,
      userId,
      organizationId: projectOrg?.organizationId,
    });

    return deleted;
  }

  async restoreFloor(id: string, userId?: string) {
    this.logger.log(`Restoring soft-deleted floor: ${id}`);

    const floor = await this.repo.findFloorById(id, true);
    if (!floor) {
      throw new NotFoundException(`Floor with ID ${id} not found.`);
    }

    if (!floor.deletedAt) {
      return floor; // Already active
    }

    const restored = await this.repo.restoreFloor(id);

    // Retrieve organizationId for audit log
    const projectOrg = floor.building?.project;

    await this.audit.log({
      action: 'RESTORE',
      tableName: 'Floor',
      recordId: id,
      oldValues: floor,
      newValues: restored,
      userId,
      organizationId: projectOrg?.organizationId,
    });

    return restored;
  }

  async reorderFloors(orderedIds: string[], userId?: string) {
    this.logger.log(`Executing floors re-ordering sequence`);

    if (!orderedIds || orderedIds.length === 0) {
      return [];
    }

    // Verify first floor exists to resolve project boundary for logging
    const firstFloor = await this.repo.findFloorById(orderedIds[0], true);
    const projectOrg = firstFloor?.building?.project;

    const result = await this.repo.updateFloorsOrder(orderedIds);

    await this.audit.log({
      action: 'UPDATE',
      tableName: 'Floor',
      recordId: orderedIds[0], // log using first changed floor as reference anchor
      newValues: { reorderedIds: orderedIds },
      userId,
      organizationId: projectOrg?.organizationId,
    });

    return result;
  }
}
