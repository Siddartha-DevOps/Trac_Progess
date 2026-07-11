import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { BuildingsRepository } from './buildings.repository';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { QueryBuildingDto } from './dto/query-building.dto';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class BuildingsService {
  private readonly logger = new Logger(BuildingsService.name);

  constructor(
    private readonly repo: BuildingsRepository,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async createBuilding(createDto: CreateBuildingDto, userId?: string) {
    this.logger.log(`Validating and creating building: ${createDto.name} for Project ID: ${createDto.projectId}`);

    // Check project existence
    const project = await this.prisma.project.findUnique({
      where: { id: createDto.projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${createDto.projectId} does not exist.`);
    }

    // Check duplicate building name in the same project
    const existing = await this.repo.findBuildingByNameAndProject(createDto.name, createDto.projectId);
    if (existing) {
      throw new ConflictException(`Building with name '${createDto.name}' already exists in this project.`);
    }

    const building = await this.repo.createBuilding(createDto);

    // Write audit log
    await this.audit.log({
      action: 'INSERT',
      tableName: 'Building',
      recordId: building.id,
      newValues: building,
      userId,
      organizationId: project.organizationId,
    });

    return building;
  }

  async updateBuilding(id: string, updateDto: UpdateBuildingDto, userId?: string) {
    this.logger.log(`Updating building: ${id}`);

    const building = await this.repo.findBuildingById(id);
    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found.`);
    }

    if (updateDto.name && updateDto.name.trim().toLowerCase() !== building.name.toLowerCase()) {
      const existing = await this.repo.findBuildingByNameAndProject(updateDto.name, building.projectId);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Building with name '${updateDto.name}' already exists in this project.`);
      }
    }

    const updated = await this.repo.updateBuilding(id, updateDto);

    // Fetch the project to get organizationId for audit log
    const project = await this.prisma.project.findUnique({
      where: { id: building.projectId },
    });

    // Write audit log
    await this.audit.log({
      action: 'UPDATE',
      tableName: 'Building',
      recordId: id,
      oldValues: building,
      newValues: updated,
      userId,
      organizationId: project?.organizationId,
    });

    return updated;
  }

  async findBuildingById(id: string, includeDeleted = false) {
    const building = await this.repo.findBuildingById(id, includeDeleted);
    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found.`);
    }
    return building;
  }

  async findAllBuildings(queryDto: QueryBuildingDto) {
    return this.repo.findAllBuildings(queryDto);
  }

  async softDeleteBuilding(id: string, userId?: string) {
    this.logger.log(`Soft deleting building: ${id}`);

    const building = await this.repo.findBuildingById(id);
    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found.`);
    }

    const deleted = await this.repo.softDeleteBuilding(id);

    // Fetch project for audit log context
    const project = await this.prisma.project.findUnique({
      where: { id: building.projectId },
    });

    // Write audit log
    await this.audit.log({
      action: 'DELETE',
      tableName: 'Building',
      recordId: id,
      oldValues: building,
      newValues: deleted,
      userId,
      organizationId: project?.organizationId,
    });

    return deleted;
  }

  async restoreBuilding(id: string, userId?: string) {
    this.logger.log(`Restoring soft-deleted building: ${id}`);

    const building = await this.repo.findBuildingById(id, true);
    if (!building) {
      throw new NotFoundException(`Building with ID ${id} not found.`);
    }

    if (!building.deletedAt) {
      return building; // Already active, no action needed
    }

    const restored = await this.repo.restoreBuilding(id);

    // Fetch project for audit log context
    const project = await this.prisma.project.findUnique({
      where: { id: building.projectId },
    });

    // Write audit log
    await this.audit.log({
      action: 'RESTORE',
      tableName: 'Building',
      recordId: id,
      oldValues: building,
      newValues: restored,
      userId,
      organizationId: project?.organizationId,
    });

    return restored;
  }

  async getProjectBuildingsAnalytics(projectId: string) {
    this.logger.log(`Retrieving building analytics for Project: ${projectId}`);

    // Check project existence
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} does not exist.`);
    }

    return this.repo.getProjectBuildingsAnalytics(projectId);
  }
}
