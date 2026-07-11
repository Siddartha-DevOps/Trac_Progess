import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { QueryBuildingDto } from './dto/query-building.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BuildingsRepository {
  private readonly logger = new Logger(BuildingsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async createBuilding(createDto: CreateBuildingDto) {
    this.logger.log(`Inserting new Building into database: ${createDto.name}`);
    return this.prisma.building.create({
      data: {
        name: createDto.name.trim(),
        description: createDto.description || null,
        type: createDto.type || 'RESIDENTIAL',
        status: createDto.status || 'PLANNING',
        floors: createDto.floors ?? 1,
        basementFloors: createDto.basementFloors ?? 0,
        totalArea: createDto.totalArea ?? 0.0,
        parkingSpaces: createDto.parkingSpaces ?? 0,
        metadata: createDto.metadata !== undefined ? (createDto.metadata as Prisma.InputJsonValue) : Prisma.JsonNull,
        address: createDto.address || null,
        city: createDto.city || null,
        state: createDto.state || null,
        postalCode: createDto.postalCode || null,
        latitude: createDto.latitude ?? null,
        longitude: createDto.longitude ?? null,
        projectId: createDto.projectId,
      },
    });
  }

  async updateBuilding(id: string, updateDto: UpdateBuildingDto) {
    this.logger.log(`Updating Building record with ID: ${id}`);
    return this.prisma.building.update({
      where: { id },
      data: {
        name: updateDto.name !== undefined ? updateDto.name.trim() : undefined,
        description: updateDto.description !== undefined ? updateDto.description : undefined,
        type: updateDto.type !== undefined ? updateDto.type : undefined,
        status: updateDto.status !== undefined ? updateDto.status : undefined,
        floors: updateDto.floors !== undefined ? updateDto.floors : undefined,
        basementFloors: updateDto.basementFloors !== undefined ? updateDto.basementFloors : undefined,
        totalArea: updateDto.totalArea !== undefined ? updateDto.totalArea : undefined,
        parkingSpaces: updateDto.parkingSpaces !== undefined ? updateDto.parkingSpaces : undefined,
        metadata: updateDto.metadata !== undefined ? (updateDto.metadata as Prisma.InputJsonValue) : undefined,
        address: updateDto.address !== undefined ? updateDto.address : undefined,
        city: updateDto.city !== undefined ? updateDto.city : undefined,
        state: updateDto.state !== undefined ? updateDto.state : undefined,
        postalCode: updateDto.postalCode !== undefined ? updateDto.postalCode : undefined,
        latitude: updateDto.latitude !== undefined ? updateDto.latitude : undefined,
        longitude: updateDto.longitude !== undefined ? updateDto.longitude : undefined,
      },
    });
  }

  async findBuildingById(id: string, includeDeleted = false) {
    const building = await this.prisma.building.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            organizationId: true,
          },
        },
      },
    });

    if (building && building.deletedAt && !includeDeleted) {
      return null;
    }

    return building;
  }

  async findBuildingByNameAndProject(name: string, projectId: string, includeDeleted = false) {
    const building = await this.prisma.building.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
        projectId,
      },
    });

    if (building && building.deletedAt && !includeDeleted) {
      return null;
    }

    return building;
  }

  async findAllBuildings(queryDto: QueryBuildingDto) {
    const { projectId, status, type, search, page = 1, limit = 10, includeDeleted = false } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.BuildingWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (status) {
      where.status = status;
    }

    if (type) {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    this.logger.log(`Executing buildings query with filters: ${JSON.stringify(where)}`);

    const [items, totalItems] = await Promise.all([
      this.prisma.building.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              organizationId: true,
            },
          },
        },
      }),
      this.prisma.building.count({ where }),
    ]);

    return { items, totalItems };
  }

  async softDeleteBuilding(id: string) {
    this.logger.log(`Setting soft-delete timestamp for Building ID: ${id}`);
    return this.prisma.building.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restoreBuilding(id: string) {
    this.logger.log(`Restoring soft-deleted Building ID: ${id}`);
    return this.prisma.building.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async getProjectBuildingsAnalytics(projectId: string) {
    const buildings = await this.prisma.building.findMany({
      where: { projectId, deletedAt: null },
    });

    const totalBuildings = buildings.length;
    const totalFloors = buildings.reduce((acc, b) => acc + b.floors, 0);
    const totalBasementFloors = buildings.reduce((acc, b) => acc + b.basementFloors, 0);
    const totalParkingSpaces = buildings.reduce((acc, b) => acc + b.parkingSpaces, 0);
    const cumulativeArea = buildings.reduce((acc, b) => acc + b.totalArea, 0.0);

    const statusBreakdown = {
      planning: buildings.filter(b => b.status === 'PLANNING').length,
      underConstruction: buildings.filter(b => b.status === 'UNDER_CONSTRUCTION').length,
      completed: buildings.filter(b => b.status === 'COMPLETED').length,
      commissioned: buildings.filter(b => b.status === 'COMMISSIONED').length,
    };

    const typeBreakdown = {
      residential: buildings.filter(b => b.type === 'RESIDENTIAL').length,
      commercial: buildings.filter(b => b.type === 'COMMERCIAL').length,
      industrial: buildings.filter(b => b.type === 'INDUSTRIAL').length,
      mixedUse: buildings.filter(b => b.type === 'MIXED_USE').length,
      other: buildings.filter(b => b.type === 'OTHER').length,
    };

    return {
      projectId,
      totalBuildings,
      totalFloors,
      totalBasementFloors,
      totalParkingSpaces,
      cumulativeArea,
      statusBreakdown,
      typeBreakdown,
    };
  }
}
