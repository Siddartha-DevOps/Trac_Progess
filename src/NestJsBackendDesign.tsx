import React, { useState } from "react";
import {
  Folder,
  FolderOpen,
  FileCode,
  Layers,
  Cpu,
  Share2,
  BookOpen,
  Settings,
  Shield,
  Users,
  Building,
  Video,
  TrendingUp,
  FileText,
  Bell,
  Clock,
  ArrowRight,
  Database,
  Terminal,
  Zap,
  Info,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Search,
  ExternalLink,
  GitBranch,
  Grid,
  Activity
} from "lucide-react";

interface FileNode {
  name: string;
  type: "file" | "folder";
  description?: string;
  code?: string;
  language?: string;
  children?: FileNode[];
}

export default function NestJsBackendDesign() {
  // Navigation & Interactive states
  const [activeTab, setActiveTab] = useState<"structure" | "di" | "components" | "explain">("structure");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFileCode, setSelectedFileCode] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState(false);
  const [diStep, setDiStep] = useState<"controller" | "service" | "repository" | "db">("controller");

  // Expanded folders in tree state
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "src": true,
    "src/modules": true,
    "src/modules/auth": true,
    "src/modules/ai": false,
    "src/modules/projects": false,
    "src/common": false,
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  // 1. NESTJS FOLDER TREE STRUCTURE DATA
  const folderTree: FileNode = {
    name: "buildtrace-nestjs-backend",
    type: "folder",
    children: [
      {
        name: "src",
        type: "folder",
        children: [
          {
            name: "modules",
            type: "folder",
            children: [
              {
                name: "auth",
                type: "folder",
                children: [
                  {
                    name: "auth.module.ts",
                    type: "file",
                    description: "Plugs JWT authentication passport strategy and exports AuthService.",
                    code: `import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'buildtrace-secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}`
                  },
                  {
                    name: "auth.service.ts",
                    type: "file",
                    description: "Manages session cryptography, bcrypt validations, and generation of active tokens.",
                    code: `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && (await bcrypt.compare(pass, user.passwordHash))) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid enterprise credentials.');
    }
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }
}`
                  },
                  {
                    name: "auth.controller.ts",
                    type: "file",
                    description: "Exposes endpoints for user authentication and credentials check.",
                    code: `import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}`
                  }
                ]
              },
              {
                name: "users",
                type: "folder",
                children: [
                  {
                    name: "users.service.ts",
                    type: "file",
                    description: "Executes profiles search and tracks access parameters.",
                    code: `import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findOneByEmail(email: string) {
    return this.usersRepository.findByEmail(email);
  }

  async create(createUserDto: CreateUserDto) {
    return this.usersRepository.save(createUserDto);
  }
}`
                  }
                ]
              },
              {
                name: "organizations",
                type: "folder",
                children: [
                  {
                    name: "organizations.service.ts",
                    type: "file",
                    description: "Enforces enterprise multitenant segregation and subscription rules.",
                    code: `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  async findOne(id: string): Promise<Organization> {
    return this.orgRepo.findOne({ where: { id } });
  }
}`
                  }
                ]
              },
              {
                name: "projects",
                type: "folder",
                children: [
                  {
                    name: "projects.service.ts",
                    type: "file",
                    description: "Coordinates financial benchmarks, safety milestones, and construction portfolios.",
                    code: `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  async listAll(): Promise<Project[]> {
    return this.projectRepo.find();
  }

  async findOne(id: string): Promise<Project> {
    const proj = await this.projectRepo.findOne({ where: { id } });
    if (!proj) throw new NotFoundException('Project not found');
    return proj;
  }
}`
                  }
                ]
              },
              {
                name: "buildings",
                type: "folder",
                children: [
                  {
                    name: "buildings.service.ts",
                    type: "file",
                    description: "Tracks active physical blocks, structures, and architectural models.",
                    code: `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Building } from './entities/building.entity';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly bldRepo: Repository<Building>
  ) {}

  async findByProject(projectId: string): Promise<Building[]> {
    return this.bldRepo.find({ where: { projectId } });
  }
}`
                  }
                ]
              },
              {
                name: "floors",
                type: "folder",
                children: [
                  {
                    name: "floors.module.ts",
                    type: "file",
                    description: "Declares controller, service, repository, and registers Prisma/Audit providers.",
                    code: `import { Module } from '@nestjs/common';
import { FloorsController } from './floors.controller';
import { FloorsService } from './floors.service';
import { FloorsRepository } from './floors.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [FloorsController],
  providers: [
    FloorsService,
    FloorsRepository,
    PrismaService,
    AuditService,
  ],
  exports: [FloorsService, FloorsRepository],
})
export class FloorsModule {}`
                  },
                  {
                    name: "floors.controller.ts",
                    type: "file",
                    description: "Exposes REST endpoints with permissions, DTO validation, and Swagger documentation.",
                    code: `import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { FloorsService } from './floors.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { QueryFloorDto } from './dto/query-floor.dto';
import { FloorResponseDto, PaginatedFloorResponseDto } from './dto/floor-response.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';

@ApiTags('Floors Module')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('floors')
export class FloorsController {
  constructor(private readonly service: FloorsService) {}

  @Post()
  @Permissions('building.update')
  @ApiOperation({ summary: 'Create a new floor level' })
  @ApiResponse({ status: HttpStatus.CREATED, type: FloorResponseDto })
  async create(@Body() createDto: CreateFloorDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.createFloor(createDto, userId);
  }

  @Get()
  @Permissions('building.read')
  @ApiOperation({ summary: 'Find and filter floor levels' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedFloorResponseDto })
  async findAll(@Query() query: QueryFloorDto) {
    return this.service.findAllFloors(query);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  @Permissions('building.update')
  @ApiOperation({ summary: 'Re-order vertical floor lists' })
  async reorder(@Body('orderedIds') orderedIds: string[], @Req() req: any) {
    const userId = req.user?.id;
    return this.service.reorderFloors(orderedIds, userId);
  }

  @Get(':id')
  @Permissions('building.read')
  @ApiOperation({ summary: 'Find single floor by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: FloorResponseDto })
  async findOne(@Param('id') id: string) {
    return this.service.findFloorById(id);
  }

  @Patch(':id')
  @Permissions('building.update')
  @ApiOperation({ summary: 'Update floor attributes' })
  @ApiResponse({ status: HttpStatus.OK, type: FloorResponseDto })
  async update(@Param('id') id: string, @Body() updateDto: UpdateFloorDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.updateFloor(id, updateDto, userId);
  }

  @Delete(':id')
  @Permissions('building.update')
  @ApiOperation({ summary: 'Soft-delete a floor level' })
  @ApiResponse({ status: HttpStatus.OK, type: FloorResponseDto })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.softDeleteFloor(id, userId);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @Permissions('building.update')
  @ApiOperation({ summary: 'Restore a soft-deleted floor level' })
  @ApiResponse({ status: HttpStatus.OK, type: FloorResponseDto })
  async restore(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.restoreFloor(id, userId);
  }
}`
                  },
                  {
                    name: "floors.service.ts",
                    type: "file",
                    description: "Coordinates business logic, checks unique constraints, and writes transaction audit logs.",
                    code: `import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { FloorsRepository } from './floors.repository';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { QueryFloorDto } from './dto/query-floor.dto';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FloorsService {
  constructor(
    private readonly repo: FloorsRepository,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async createFloor(createDto: CreateFloorDto, userId?: string) {
    const building = await this.prisma.building.findUnique({ where: { id: createDto.buildingId } });
    if (!building) throw new NotFoundException('Building not found');

    const existingLevel = await this.repo.findFloorByLevelNumberAndBuilding(createDto.number, createDto.buildingId);
    if (existingLevel) throw new ConflictException('Floor level already exists');

    const existingName = await this.repo.findFloorByNameAndBuilding(createDto.name, createDto.buildingId);
    if (existingName) throw new ConflictException('Floor name already exists');

    const floor = await this.repo.createFloor(createDto);
    const project = await this.prisma.project.findUnique({ where: { id: building.projectId } });

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
    const floor = await this.repo.findFloorById(id);
    if (!floor) throw new NotFoundException('Floor not found');

    if (updateDto.name && updateDto.name.trim().toLowerCase() !== floor.name.toLowerCase()) {
      const existing = await this.repo.findFloorByNameAndBuilding(updateDto.name, floor.buildingId);
      if (existing && existing.id !== id) throw new ConflictException('Floor name already exists');
    }

    const updated = await this.repo.updateFloor(id, updateDto);
    await this.audit.log({
      action: 'UPDATE',
      tableName: 'Floor',
      recordId: id,
      newValues: updated,
      userId,
      organizationId: floor.building?.project?.organizationId,
    });
    return updated;
  }

  async findFloorById(id: string) {
    const floor = await this.repo.findFloorById(id);
    if (!floor) throw new NotFoundException('Floor not found');
    return floor;
  }

  async findAllFloors(query: QueryFloorDto) {
    return this.repo.findAllFloors(query);
  }

  async softDeleteFloor(id: string, userId?: string) {
    const floor = await this.repo.findFloorById(id);
    if (!floor) throw new NotFoundException('Floor not found');
    const deleted = await this.repo.softDeleteFloor(id);
    await this.audit.log({
      action: 'DELETE',
      tableName: 'Floor',
      recordId: id,
      newValues: deleted,
      userId,
      organizationId: floor.building?.project?.organizationId,
    });
    return deleted;
  }

  async reorderFloors(orderedIds: string[], userId?: string) {
    const result = await this.repo.updateFloorsOrder(orderedIds);
    return result;
  }
}`
                  },
                  {
                    name: "floors.repository.ts",
                    type: "file",
                    description: "Interacts directly with Prisma Client to handle DB operations, paging, and soft deletes.",
                    code: `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { QueryFloorDto } from './dto/query-floor.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FloorsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createFloor(createDto: CreateFloorDto) {
    return this.prisma.floor.create({
      data: {
        name: createDto.name.trim(),
        description: createDto.description,
        number: createDto.number,
        order: createDto.order,
        totalArea: createDto.totalArea || 0,
        buildingId: createDto.buildingId,
      }
    });
  }

  async findFloorById(id: string, includeDeleted = false) {
    return this.prisma.floor.findFirst({
      where: { id, deletedAt: includeDeleted ? undefined : null },
      include: { building: { include: { project: true } } }
    });
  }

  async findFloorByLevelNumberAndBuilding(number: number, buildingId: string) {
    return this.prisma.floor.findFirst({ where: { number, buildingId, deletedAt: null } });
  }

  async findFloorByNameAndBuilding(name: string, buildingId: string) {
    return this.prisma.floor.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, buildingId, deletedAt: null }
    });
  }

  async findAllFloors(query: QueryFloorDto) {
    const { buildingId, status, search, page = 1, limit = 10 } = query;
    const where: Prisma.FloorWhereInput = { deletedAt: null };
    if (buildingId) where.buildingId = buildingId;
    if (status) where.status = status;
    const [items, totalItems] = await Promise.all([
      this.prisma.floor.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { order: 'asc' } }),
      this.prisma.floor.count({ where })
    ]);
    return { items, totalItems };
  }

  async updateFloorsOrder(orderedIds: string[]) {
    return this.prisma.$transaction(
      orderedIds.map((id, index) => this.prisma.floor.update({ where: { id }, data: { order: index } }))
    );
  }
}`
                  }
                ]
              },
              {
                name: "rooms",
                type: "folder",
                children: [
                  {
                    name: "rooms.module.ts",
                    type: "file",
                    description: "Declares controller, service, repository, and registers Prisma/Audit providers.",
                    code: `import { Module } from '@nestjs/common';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { RoomsRepository } from './rooms.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [RoomsController],
  providers: [
    RoomsService,
    RoomsRepository,
    PrismaService,
    AuditService,
  ],
  exports: [RoomsService, RoomsRepository],
})
export class RoomsModule {}`
                  },
                  {
                    name: "rooms.controller.ts",
                    type: "file",
                    description: "Exposes CRUD REST endpoints with authentication, permissions, DTO validation, and Swagger documentation.",
                    code: `import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { RoomResponseDto, PaginatedRoomResponseDto } from './dto/room-response.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';

@ApiTags('Rooms Module')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Post()
  @Permissions('building.update')
  @ApiOperation({ summary: 'Create a new room' })
  @ApiResponse({ status: HttpStatus.CREATED, type: RoomResponseDto })
  async create(@Body() createDto: CreateRoomDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.createRoom(createDto, userId);
  }

  @Get()
  @Permissions('building.read')
  @ApiOperation({ summary: 'Find and filter rooms' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedRoomResponseDto })
  async findAll(@Query() query: QueryRoomDto) {
    return this.service.findAllRooms(query);
  }

  @Get(':id')
  @Permissions('building.read')
  @ApiOperation({ summary: 'Find single room by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: RoomResponseDto })
  async findOne(@Param('id') id: string) {
    return this.service.findRoomById(id);
  }

  @Patch(':id')
  @Permissions('building.update')
  @ApiOperation({ summary: 'Update room attributes' })
  @ApiResponse({ status: HttpStatus.OK, type: RoomResponseDto })
  async update(@Param('id') id: string, @Body() updateDto: UpdateRoomDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.updateRoom(id, updateDto, userId);
  }

  @Delete(':id')
  @Permissions('building.update')
  @ApiOperation({ summary: 'Soft-delete a room' })
  @ApiResponse({ status: HttpStatus.OK, type: RoomResponseDto })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.softDeleteRoom(id, userId);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @Permissions('building.update')
  @ApiOperation({ summary: 'Restore a soft-deleted room' })
  @ApiResponse({ status: HttpStatus.OK, type: RoomResponseDto })
  async restore(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.restoreRoom(id, userId);
  }
}`
                  },
                  {
                    name: "rooms.service.ts",
                    type: "file",
                    description: "Coordinates room business logic, unique designations on floors, geometry checks, and transaction audit logs.",
                    code: `import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { RoomsRepository } from './rooms.repository';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class RoomsService {
  constructor(
    private readonly repo: RoomsRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createRoom(createDto: CreateRoomDto, userId?: string) {
    const floor = await this.prisma.floor.findUnique({
      where: { id: createDto.floorId, deletedAt: null },
      include: { building: { select: { projectId: true, project: { select: { organizationId: true } } } } }
    });
    if (!floor) throw new NotFoundException('Floor level not found');

    const existingRoom = await this.repo.findRoomByNameAndFloor(createDto.name, createDto.floorId);
    if (existingRoom) throw new ConflictException('Room name already exists on this floor');

    const room = await this.repo.createRoom(createDto);
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
    const existingRoom = await this.repo.findRoomById(id);
    if (!existingRoom) throw new NotFoundException('Room not found');

    if (updateDto.name && updateDto.name.trim().toLowerCase() !== existingRoom.name.toLowerCase()) {
      const duplicate = await this.repo.findRoomByNameAndFloor(updateDto.name, existingRoom.floorId);
      if (duplicate && duplicate.id !== id) throw new ConflictException('Room name already exists on this floor');
    }

    const updated = await this.repo.updateRoom(id, updateDto);
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
    const room = await this.repo.findRoomById(id);
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async findAllRooms(query: QueryRoomDto) {
    return this.repo.findAllRooms(query);
  }

  async softDeleteRoom(id: string, userId?: string) {
    const room = await this.repo.findRoomById(id);
    if (!room) throw new NotFoundException('Room not found');
    const deleted = await this.repo.softDeleteRoom(id);
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
}`
                  },
                  {
                    name: "rooms.repository.ts",
                    type: "file",
                    description: "Interacts directly with Prisma Client to handle DB operations, paging, soft deletes, and geometries.",
                    code: `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RoomsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createRoom(createDto: CreateRoomDto) {
    return this.prisma.room.create({
      data: {
        name: createDto.name.trim(),
        category: createDto.category || 'OFFICE',
        status: createDto.status || 'PLANNING',
        description: createDto.description,
        totalArea: createDto.totalArea || 0.0,
        height: createDto.height || 0.0,
        perimeter: createDto.perimeter || 0.0,
        geometry: createDto.geometry || Prisma.JsonNull,
        metadata: createDto.metadata || Prisma.JsonNull,
        floorId: createDto.floorId,
      }
    });
  }

  async findRoomById(id: string, includeDeleted = false) {
    return this.prisma.room.findFirst({
      where: { id, deletedAt: includeDeleted ? undefined : null },
      include: { floor: { include: { building: { include: { project: true } } } } }
    });
  }

  async findRoomByNameAndFloor(name: string, floorId: string) {
    return this.prisma.room.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' }, floorId, deletedAt: null }
    });
  }

  async findAllRooms(query: QueryRoomDto) {
    const { floorId, status, category, search, page = 1, limit = 10 } = query;
    const where: Prisma.RoomWhereInput = { deletedAt: null };
    if (floorId) where.floorId = floorId;
    if (status) where.status = status;
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    const [items, totalItems] = await Promise.all([
      this.prisma.room.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { name: 'asc' } }),
      this.prisma.room.count({ where })
    ]);
    return { items, totalItems };
  }

  async softDeleteRoom(id: string) {
    return this.prisma.room.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async restoreRoom(id: string) {
    return this.prisma.room.update({ where: { id }, data: { deletedAt: null } });
  }
}`
                  }
                ]
              },
              {
                name: "bim",
                type: "folder",
                children: [
                  {
                    name: "bim.module.ts",
                    type: "file",
                    description: "Registers BIMController, BIMService, and BIMRepository for dependency injection.",
                    code: `import { Module } from '@nestjs/common';
import { BimController } from './bim.controller';
import { BimService } from './bim.service';
import { BimRepository } from './bim.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [BimController],
  providers: [
    BimService,
    BimRepository,
    PrismaService,
    AuditService,
  ],
  exports: [BimService, BimRepository],
})
export class BimModule {}`
                  },
                  {
                    name: "bim.controller.ts",
                    type: "file",
                    description: "Defines REST endpoints for uploading IFC/Revit models, aligning coordinate systems, and comparing versions.",
                    code: `import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BimService } from './bim.service';
import { CreateBimModelDto } from './dto/create-bim-model.dto';
import { UpdateBimModelDto } from './dto/update-bim-model.dto';
import { QueryBimModelDto } from './dto/query-bim-model.dto';
import { CompareBimModelsDto } from './dto/compare-bim-models.dto';
import { BimModelResponseDto, PaginatedBimModelResponseDto } from './dto/bim-response.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';

@ApiTags('BIM Module')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('bim')
export class BimController {
  constructor(private readonly service: BimService) {}

  @Post()
  @Permissions('building.update')
  @ApiOperation({ summary: 'Upload and parse a new BIM model (IFC or Revit)' })
  @ApiResponse({ status: HttpStatus.CREATED, type: BimModelResponseDto })
  async create(@Body() createDto: CreateBimModelDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.createModel(createDto, userId);
  }

  @Get()
  @Permissions('building.read')
  @ApiOperation({ summary: 'List and filter BIM models' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedBimModelResponseDto })
  async findAll(@Query() query: QueryBimModelDto) {
    return this.service.findAllModels(query);
  }

  @Post('compare')
  @HttpCode(HttpStatus.OK)
  @Permissions('building.read')
  @ApiOperation({ summary: 'Compare two BIM model versions for structural changes' })
  async compare(@Body() compareDto: CompareBimModelsDto) {
    return this.service.compareModels(compareDto);
  }

  @Get(':id')
  @Permissions('building.read')
  @ApiOperation({ summary: 'Retrieve details and elements of a single BIM model' })
  @ApiResponse({ status: HttpStatus.OK, type: BimModelResponseDto })
  async findOne(@Param('id') id: string) {
    return this.service.findModelById(id);
  }

  @Patch(':id')
  @Permissions('building.update')
  @ApiOperation({ summary: 'Update model description, status, metadata, or coordinates' })
  @ApiResponse({ status: HttpStatus.OK, type: BimModelResponseDto })
  async update(@Param('id') id: string, @Body() updateDto: UpdateBimModelDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.updateModel(id, updateDto, userId);
  }

  @Delete(':id')
  @Permissions('building.update')
  @ApiOperation({ summary: 'Soft-delete a BIM model' })
  @ApiResponse({ status: HttpStatus.OK, type: BimModelResponseDto })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.softDeleteModel(id, userId);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @Permissions('building.update')
  @ApiOperation({ summary: 'Restore a soft-deleted BIM model' })
  @ApiResponse({ status: HttpStatus.OK, type: BimModelResponseDto })
  async restore(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.restoreModel(id, userId);
  }

  @Post(':id/align')
  @HttpCode(HttpStatus.OK)
  @Permissions('building.update')
  @ApiOperation({ summary: 'Align model coordinate system to drone real-world bounds' })
  @ApiResponse({ status: HttpStatus.OK, type: BimModelResponseDto })
  async alignCoordinates(
    @Param('id') id: string,
    @Body() alignDto: { coordinateSystem: Record<string, any> },
    @Req() req: any,
  ) {
    const userId = req.user?.id;
    return this.service.alignCoordinates(id, alignDto.coordinateSystem, userId);
  }
}`
                  },
                  {
                    name: "bim.service.ts",
                    type: "file",
                    description: "Implements file parsing format validations, automated version numbering, coordinate alignments, and element comparison.",
                    code: `import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { BimRepository } from './bim.repository';
import { CreateBimModelDto } from './dto/create-bim-model.dto';
import { UpdateBimModelDto } from './dto/update-bim-model.dto';
import { QueryBimModelDto } from './dto/query-bim-model.dto';
import { CompareBimModelsDto } from './dto/compare-bim-models.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Injectable()
export class BimService {
  constructor(
    private readonly repo: BimRepository,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async createModel(createDto: CreateBimModelDto, userId?: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: createDto.projectId, deletedAt: null },
    });
    if (!project) throw new NotFoundException('Project not found or deleted.');

    const extension = createDto.fileUrl.split('.').pop()?.toLowerCase();
    const typeUpper = createDto.fileType.toUpperCase();
    if (typeUpper === 'IFC' && extension !== 'ifc') {
      throw new BadRequestException('IFC models require a .ifc file extension.');
    }
    if (typeUpper === 'RVT' && extension !== 'rvt') {
      throw new BadRequestException('Revit models require a .rvt file extension.');
    }

    const latestModel = await this.repo.findLatestVersion(createDto.projectId, createDto.name);
    const versionNumber = latestModel ? latestModel.version + 1 : 1;

    const model = await this.repo.createModel(createDto, versionNumber);

    await this.audit.log({
      action: 'INSERT',
      tableName: 'BimModel',
      recordId: model.id,
      newValues: model,
      userId,
      organizationId: project.organizationId,
    });

    const mockExtractedElements = this.simulateElementExtraction(model.id, model.fileType);
    await this.repo.createElements(model.id, mockExtractedElements);

    const updatedModel = await this.repo.updateModel(model.id, {
      status: 'COMPLETED',
      metadata: {
        ...((model.metadata as Record<string, any>) || {}),
        extractedElementsCount: mockExtractedElements.length,
        softwareSource: model.fileType === 'IFC' ? 'IFCOpenShell v0.7.0' : 'Revit API Forge Engine',
      },
    });

    return updatedModel;
  }

  async findModelById(id: string) {
    const model = await this.repo.findModelById(id, true);
    if (!model) throw new NotFoundException('BIM Model not found.');
    return model;
  }

  async updateModel(id: string, updateDto: UpdateBimModelDto, userId?: string) {
    const existing = await this.repo.findModelById(id);
    if (!existing) throw new NotFoundException('BIM Model not found.');

    const updated = await this.repo.updateModel(id, updateDto);
    await this.audit.log({
      action: 'UPDATE',
      tableName: 'BimModel',
      recordId: id,
      newValues: updated,
      userId,
      organizationId: existing.project?.organizationId,
    });
    return updated;
  }

  async findAllModels(query: QueryBimModelDto) {
    return this.repo.findAllModels(query);
  }

  async softDeleteModel(id: string, userId?: string) {
    const existing = await this.repo.findModelById(id);
    if (!existing) throw new NotFoundException('BIM Model not found.');

    const deleted = await this.repo.softDeleteModel(id);
    await this.audit.log({
      action: 'DELETE',
      tableName: 'BimModel',
      recordId: id,
      newValues: deleted,
      userId,
      organizationId: existing.project?.organizationId,
    });
    return deleted;
  }

  async restoreModel(id: string, userId?: string) {
    const existing = await this.repo.findModelById(id, false, true);
    if (!existing) throw new NotFoundException('BIM Model not found.');

    const restored = await this.repo.restoreModel(id);
    await this.audit.log({
      action: 'RESTORE',
      tableName: 'BimModel',
      recordId: id,
      newValues: restored,
      userId,
      organizationId: existing.project?.organizationId,
    });
    return restored;
  }

  async alignCoordinates(id: string, coordinateSystem: Record<string, any>, userId?: string) {
    if (!coordinateSystem.origin || !coordinateSystem.crs) {
      throw new BadRequestException('Coordinate Alignment requires crs and origin properties.');
    }
    return this.updateModel(id, { coordinateSystem }, userId);
  }

  async compareModels(compareDto: CompareBimModelsDto) {
    const sourceModel = await this.repo.findModelById(compareDto.sourceModelId, false);
    const targetModel = await this.repo.findModelById(compareDto.targetModelId, false);

    if (!sourceModel || !targetModel) throw new NotFoundException('One or both BIM models could not be found.');
    if (sourceModel.projectId !== targetModel.projectId) {
      throw new BadRequestException('Model comparison must be done within the same project bounds.');
    }

    const sourceElements = await this.repo.findElementsByModel(compareDto.sourceModelId);
    const targetElements = await this.repo.findElementsByModel(compareDto.targetModelId);

    const sourceMap = new Map(sourceElements.map(el => [el.externalId, el]));
    const targetMap = new Map(targetElements.map(el => [el.externalId, el]));

    const added: any[] = [];
    const deleted: any[] = [];
    const modified: any[] = [];
    let unchangedCount = 0;

    for (const [extId, targetEl] of targetMap.entries()) {
      const sourceEl = sourceMap.get(extId);
      if (!sourceEl) {
        added.push(targetEl);
      } else {
        const isModified = this.areElementsDifferent(sourceEl, targetEl);
        if (isModified) {
          modified.push({
            elementId: targetEl.id,
            externalId: extId,
            name: targetEl.name,
            type: targetEl.type,
            changes: {
              previousProperties: sourceEl.properties,
              updatedProperties: targetEl.properties,
              previousGeometry: sourceEl.geometry,
              updatedGeometry: targetEl.geometry,
            },
          });
        } else {
          unchangedCount++;
        }
      }
    }

    for (const [extId, sourceEl] of sourceMap.entries()) {
      if (!targetMap.has(extId)) deleted.push(sourceEl);
    }

    return {
      comparisonSummary: {
        addedCount: added.length,
        deletedCount: deleted.length,
        modifiedCount: modified.length,
        unchangedCount,
        totalSourceElements: sourceElements.length,
        totalTargetElements: targetElements.length,
      },
      added,
      deleted,
      modified,
    };
  }

  private areElementsDifferent(source: any, target: any): boolean {
    const sourceVol = source.properties?.Volume || source.properties?.volume;
    const targetVol = target.properties?.Volume || target.properties?.volume;
    if (sourceVol !== targetVol) return true;

    const sourceArea = source.properties?.Area || source.properties?.area;
    const targetArea = target.properties?.Area || target.properties?.area;
    if (sourceArea !== targetArea) return true;

    const sourceGeo = JSON.stringify(source.geometry);
    const targetGeo = JSON.stringify(target.geometry);
    return sourceGeo !== targetGeo;
  }

  private simulateElementExtraction(modelId: string, format: string) {
    const elements: any[] = [];
    if (format.toUpperCase() === 'IFC') {
      elements.push(
        {
          externalId: 'IFC-WALL-0192A9',
          name: 'Concrete Wall Standard Case [C25/30]',
          type: 'IFCWALLSTANDARDCASE',
          category: 'Structural',
          geometry: { boundingBox: { min: [0, 0, 0], max: [5, 0.3, 3] } },
          properties: { Volume: '4.5 cum', Area: '15.0 sqm', Height: '3.0m', Material: 'Concrete C25/30' },
        },
        {
          externalId: 'IFC-SLAB-09A111',
          name: 'Suspended Floor Slab [C30/37]',
          type: 'IFCSLAB',
          category: 'Structural',
          geometry: { boundingBox: { min: [0, 0, 3], max: [12, 10, 3.2] } },
          properties: { Volume: '24.0 cum', Area: '120.0 sqm', Thickness: '200mm' },
        }
      );
    } else {
      elements.push(
        {
          externalId: 'RVT-WALL-772183',
          name: 'Basic Wall: Generic - 200mm Concrete',
          type: 'Wall',
          category: 'Architectural',
          geometry: { boundingBox: { min: [0, 0, 0], max: [8, 0.2, 2.9] } },
          properties: { volume: '3.2 cum', area: '16.0 sqm', width: '200mm' },
        }
      );
    }
    return elements;
  }
}`
                  },
                  {
                    name: "bim.repository.ts",
                    type: "file",
                    description: "Leverages Prisma Client to persist parsed models, versions, metadata configurations, and coordinates.",
                    code: `import { Injectable } from '@nestjs/common';
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

    return this.prisma.bimModel.update({ where: { id }, data });
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
    return this.prisma.bimModel.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  async restoreModel(id: string) {
    return this.prisma.bimModel.update({ where: { id }, data: { deletedAt: null } });
  }

  async createElements(modelId: string, elements: any[]) {
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
    return this.prisma.bimElement.findMany({ where: { modelId }, orderBy: { name: 'asc' } });
  }
}`
                  }
                ]
              },
              {
                name: "videos",
                type: "folder",
                children: [
                  {
                    name: "videos.service.ts",
                    type: "file",
                    description: "Coordinates raw video streams uploaded by crane cameras and schedules worker processes.",
                    code: `import { Injectable } from '@nestjs/common';
import { StorageService } from '../../storage/storage.service';
import { QueuesService } from '../../queues/queues.service';

@Injectable()
export class VideosService {
  constructor(
    private readonly storageService: StorageService,
    private readonly queuesService: QueuesService,
  ) {}

  async handleSurveyUpload(roomId: string, fileBuffer: Buffer, fileName: string) {
    // 1. Upload chunk to private cloud storage
    const path = \`surveys/\${roomId}/\${Date.now()}_\${fileName}\`;
    const uploadUrl = await this.storageService.uploadFile(path, fileBuffer);

    // 2. Schedule background AI worker processing inside Redis Queue
    const job = await this.queuesService.addAiJob({
      videoUrl: uploadUrl,
      roomId,
      model: 'YOLOv8x-Rebar',
    });

    return {
      status: 'queued',
      videoPath: uploadUrl,
      jobId: job.id,
    };
  }
}`
                  }
                ]
              },
              {
                name: "ai",
                type: "folder",
                children: [
                  {
                    name: "ai.service.ts",
                    type: "file",
                    description: "Triggers computer vision engines to check stirrup density patterns.",
                    code: `import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly pyServerUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.pyServerUrl = this.configService.get<string>('FASTAPI_HOST_URL');
  }

  async triggerRebarSegmentation(videoUrl: string, threshold: number) {
    const response = await this.httpService.axiosRef.post(\`\${this.pyServerUrl}/ai/rebar-detect\`, {
      video_url: videoUrl,
      confidence_threshold: threshold,
    });
    return response.data;
  }
}`
                  }
                ]
              },
              {
                name: "ai-processing",
                type: "folder",
                children: [
                  {
                    name: "ai-processing.module.ts",
                    type: "file",
                    description: "Registers controllers, services, repositories and database connections.",
                    code: `import { Module } from '@nestjs/common';
import { AiProcessingController } from './ai-processing.controller';
import { AiProcessingService } from './ai-processing.service';
import { AiProcessingRepository } from './ai-processing.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [AiProcessingController],
  providers: [
    AiProcessingService,
    AiProcessingRepository,
    PrismaService,
    AuditService,
  ],
  exports: [AiProcessingService, AiProcessingRepository],
})
export class AiProcessingModule {}`
                  },
                  {
                    name: "ai-processing.controller.ts",
                    type: "file",
                    description: "REST controller exposing endpoints for queue management, status queries, retries, and logs.",
                    code: `import { Controller, Get, Post, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AiProcessingService } from './ai-processing.service';
import { CreateAiJobDto } from './dto/create-ai-job.dto';
import { QueryAiJobDto } from './dto/query-ai-job.dto';
import { AiJobResponseDto, QueueMetricsResponseDto } from './dto/ai-job-response.dto';

@ApiTags('AI Processing Module')
@ApiBearerAuth()
@Controller('ai-processing')
export class AiProcessingController {
  constructor(private readonly aiService: AiProcessingService) {}

  @Post('jobs')
  @ApiOperation({ summary: 'Enqueue a new background AI workload' })
  async create(@Body() createDto: CreateAiJobDto, @Req() req: any) {
    return this.aiService.createJob(createDto, req.user?.id);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Query and list background AI jobs with filtering' })
  async findAll(@Query() query: QueryAiJobDto) {
    return this.aiService.listJobs(query);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Retrieve active BullMQ queue, job status, and GPU hardware metrics' })
  async getMetrics(@Query('projectId') projectId?: string) {
    return this.aiService.getQueueMetrics(projectId);
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Fetch single AI job progress and hardware statistics' })
  async findOne(@Param('id') id: string) {
    return this.aiService.getJobById(id);
  }

  @Post('jobs/:id/retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Manually retry a failed or stalled background job' })
  async retry(@Param('id') id: string, @Req() req: any) {
    return this.aiService.retryJob(id, req.user?.id);
  }
}`
                  },
                  {
                    name: "ai-processing.service.ts",
                    type: "file",
                    description: "Handles job queuing, background thread simulation, SIFT keypoints matching, ICP matrices, and Gemini API requests.",
                    code: `import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { AiProcessingRepository } from './ai-processing.repository';
import { CreateAiJobDto } from './dto/create-ai-job.dto';
import { QueryAiJobDto } from './dto/query-ai-job.dto';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AiProcessingService {
  constructor(
    private readonly repo: AiProcessingRepository,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async createJob(createDto: CreateAiJobDto, userId?: string) {
    const project = await this.prisma.project.findUnique({ where: { id: createDto.projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const job = await this.repo.createJob(createDto);
    await this.audit.log({
      action: 'INSERT',
      tableName: 'AiJob',
      recordId: job.id,
      newValues: job,
      userId,
    });

    this.processBackgroundJob(job.id);
    return job;
  }

  async retryJob(id: string, userId?: string) {
    const job = await this.repo.findJobById(id);
    if (!job) throw new NotFoundException('Job not found');
    if (job.status !== 'FAILED') throw new BadRequestException('Only failed jobs can be retried');

    const updated = await this.repo.updateJob(id, {
      status: 'PENDING',
      retryCount: job.retryCount + 1,
      progressPercent: 0,
    });
    this.processBackgroundJob(id);
    return updated;
  }

  private async processBackgroundJob(jobId: string) {
    // Multi-step background photogrammetry execution worker...
  }
}`
                  },
                  {
                    name: "ai-processing.repository.ts",
                    type: "file",
                    description: "Enforces database queries using Prisma Client on the AiJob table.",
                    code: `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateAiJobDto } from './dto/create-ai-job.dto';
import { QueryAiJobDto } from './dto/query-ai-job.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AiProcessingRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createJob(createDto: CreateAiJobDto) {
    return this.prisma.aiJob.create({
      data: {
        jobType: createDto.jobType,
        projectId: createDto.projectId,
        videoId: createDto.videoId || null,
        gpuRequired: createDto.gpuRequired || false,
        maxRetries: createDto.maxRetries ?? 3,
      }
    });
  }

  async findJobById(id: string) {
    return this.prisma.aiJob.findUnique({ where: { id } });
  }

  async findJobs(query: QueryAiJobDto) {
    const skip = (query.page - 1) * query.limit;
    return this.prisma.aiJob.findMany({ skip, take: query.limit });
  }
}`
                  }
                ]
              },
              {
                name: "progress",
                type: "folder",
                children: [
                  {
                    name: "progress.module.ts",
                    type: "file",
                    description: "Ties the Progress Controller, Service, and Repository together with NestJS Module decorators.",
                    code: `import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';
import { ProgressRepository } from './progress.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [ProgressController],
  providers: [
    ProgressService,
    ProgressRepository,
    PrismaService,
    AuditService,
  ],
  exports: [ProgressService, ProgressRepository],
})
export class ProgressModule {}`
                  },
                  {
                    name: "progress.controller.ts",
                    type: "file",
                    description: "Exposes REST endpoints for recording progress, creating snapshots, and querying aggregated metrics.",
                    code: `import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiHeader, ApiQuery } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { CreateProgressDto, CreateSnapshotDto } from './dto/create-progress.dto';
import { QueryProgressDto } from './dto/query-progress.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';

@ApiTags('Progress Engine Module')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Permissions('write:progress')
  @ApiOperation({ summary: 'Record physical progress update for an item/trade element' })
  async createProgressRecord(@Body() dto: CreateProgressDto, @Req() req: any) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.createProgressRecord(dto, userId);
  }

  @Patch(':id')
  @Permissions('write:progress')
  @ApiOperation({ summary: 'Modify an existing progress record (actual quantities installed)' })
  async updateProgressRecord(@Param('id') id: string, @Body() dto: Partial<CreateProgressDto>, @Req() req: any) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.updateProgressRecord(id, dto, userId);
  }

  @Get('snapshots')
  @Permissions('read:progress')
  @ApiOperation({ summary: 'Fetch S-curve historical completion snapshots for analytics' })
  async getProjectSnapshots(@Query('projectId') projectId: string, @Query('buildingId') buildingId?: string) {
    return this.service.getProjectSnapshots(projectId, buildingId);
  }

  @Get('aggregates')
  @Permissions('read:progress')
  @ApiOperation({ summary: 'Query high-fidelity progress calculations dynamically aggregated' })
  async getAggregatedProgress(
    @Query('projectId') projectId: string,
    @Query('buildingId') buildingId?: string,
    @Query('floorId') floorId?: string,
    @Query('roomId') roomId?: string
  ) {
    return this.service.getAggregatedProgress(projectId, buildingId, floorId, roomId);
  }
}`
                  },
                  {
                    name: "progress.service.ts",
                    type: "file",
                    description: "Executes composite weighted aggregations, calculates actual vs planned variance, and updates chronological S-curves.",
                    code: `import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { ProgressRepository } from './progress.repository';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProgressDto, CreateSnapshotDto } from './dto/create-progress.dto';
import { QueryProgressDto } from './dto/query-progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    private readonly repo: ProgressRepository,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService,
  ) {}

  async createProgressRecord(dto: CreateProgressDto, userId?: string) {
    const project = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
    if (!project) throw new NotFoundException('Project not found');

    const record = await this.repo.createProgressRecord(dto);
    await this.audit.log({
      action: 'INSERT',
      tableName: 'ProgressRecord',
      recordId: record.id,
      newValues: record,
      userId,
      organizationId: project.organizationId,
    });
    return record;
  }

  async getAggregatedProgress(projectId: string, buildingId?: string, floorId?: string, roomId?: string) {
    return this.repo.aggregateProgressByFilter({ projectId, buildingId, floorId, roomId });
  }
}`
                  },
                  {
                    name: "progress.repository.ts",
                    type: "file",
                    description: "Executes database queries using Prisma Client on the ProgressRecord and ProgressSnapshot tables.",
                    code: `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProgressDto, CreateSnapshotDto } from './dto/create-progress.dto';

@Injectable()
export class ProgressRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createProgressRecord(dto: CreateProgressDto) {
    return this.prisma.progressRecord.create({ data: dto });
  }

  async aggregateProgressByFilter(filter: any) {
    // Computes: Sum(installedQty * unitWeight) / Sum(totalQty * unitWeight) * 100
    const records = await this.prisma.progressRecord.findMany({ where: filter });
    let totalWeighted = 0;
    let completedWeighted = 0;
    records.forEach(r => {
      totalWeighted += r.totalQuantity * r.unitWeight;
      completedWeighted += r.installedQuantity * r.unitWeight;
    });
    const completionPercent = totalWeighted > 0 ? (completedWeighted / totalWeighted) * 100 : 0;
    return { completionPercent, remainingWork: totalWeighted - completedWeighted };
  }
}`
                  }
                ]
              },
              {
                name: "reports",
                type: "folder",
                children: [
                  {
                    name: "reports.module.ts",
                    type: "file",
                    description: "Ties the Reports Controller, Service, and Repository together with NestJS Module decorators.",
                    code: `import { Module } from '@nestjs/common';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { ReportsRepository } from './reports.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, ReportsRepository, PrismaService, AuditService],
  exports: [ReportsService, ReportsRepository],
})
export class ReportsModule {}`
                  },
                  {
                    name: "reports.controller.ts",
                    type: "file",
                    description: "Exposes REST endpoints to generate, query, download, and delete structured PDF/Excel reports.",
                    code: `import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards, Req, Res, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryReportDto } from './dto/query-report.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { Response } from 'express';

@ApiTags('Reports Module')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Generate progress, delay, daily, weekly, monthly or executive audit reports' })
  async createReport(@Body() dto: CreateReportDto, @Req() req: any) {
    return this.service.createReport(dto, req.headers['x-user-id']);
  }

  @Get()
  @ApiOperation({ summary: 'Filter and browse historical generated reports' })
  async getReports(@Query() query: QueryReportDto) {
    return this.service.getReports(query);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download physical PDF/Excel binary sheets compiled dynamically' })
  async downloadReportFile(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename, contentType } = await this.service.generateFileBuffer(id);
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': \`attachment; filename="\${filename}"\`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}`
                  },
                  {
                    name: "reports.service.ts",
                    type: "file",
                    description: "Compiles project audit logs into standardized PDF executive layouts and Excel-compatible sheets.",
                    code: `import { Injectable } from '@nestjs/common';
import { ReportsRepository } from './reports.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateReportDto } from './dto/create-report.dto';

@Injectable()
export class ReportsService {
  constructor(
    private readonly repo: ReportsRepository,
    private readonly prisma: PrismaService,
  ) {}

  async createReport(dto: CreateReportDto, userId?: string) {
    return this.repo.createReport(dto, { compiledAt: new Date() });
  }
}`
                  }
                ]
              },
              {
                name: "notifications",
                type: "folder",
                children: [
                  {
                    name: "notifications.module.ts",
                    type: "file",
                    description: "Ties the Notifications Controller, Service, and Repository together with NestJS Module decorators.",
                    code: `import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    NotificationsRepository,
    PrismaService,
    AuditService,
  ],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}`
                  },
                  {
                    name: "notifications.controller.ts",
                    type: "file",
                    description: "Exposes REST endpoints to trigger notifications across Email, SMS, Push, and In-App channels, run retry sweeps, and query telemetry logs.",
                    code: `import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { TriggerNotificationDto } from './dto/trigger-notification.dto';
import { QueryNotificationDto } from './dto/query-notification.dto';
import { AuthGuard } from '../../common/auth/auth.guard';

@ApiTags('Notifications Module')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Post('trigger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger broadcast across multiple channels (Email, SMS, Push, In-App)' })
  async triggerNotification(@Body() dto: TriggerNotificationDto, @Req() req: any) {
    return this.service.triggerNotification(dto, req.headers['x-user-id']);
  }

  @Post('retry')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger background queue retry sweeper task for failed notifications' })
  async retryFailedNotifications() {
    return this.service.retryFailedNotifications();
  }

  @Get('logs')
  @ApiOperation({ summary: 'Query paginated dispatch histories and delivery status logs' })
  async getLogs(@Query() query: QueryNotificationDto) {
    return this.service.getLogs(query);
  }

  @Post('templates')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a custom notification template with variable placeholders' })
  async createTemplate(@Body() dto: CreateTemplateDto, @Req() req: any) {
    return this.service.createTemplate(dto, req.headers['x-user-id']);
  }
}`
                  },
                  {
                    name: "notifications.service.ts",
                    type: "file",
                    description: "Performs template variable interpolation, handles simulated hardware gateway dispatches, and powers the automatic queue retry engine.",
                    code: `import { Injectable, OnModuleInit } from '@nestjs/common';
import { NotificationsRepository } from './notifications.repository';
import { TriggerNotificationDto } from './dto/trigger-notification.dto';

@Injectable()
export class NotificationsService implements OnModuleInit {
  constructor(
    private readonly repo: NotificationsRepository,
  ) {}

  async onModuleInit() {
    await this.seedDefaultTemplates();
  }

  async triggerNotification(dto: TriggerNotificationDto, userId?: string) {
    // 1. Interpolate placeholders
    // 2. Dispatch simulated channels
    // 3. Log results & handle queue retries
  }

  async retryFailedNotifications(maxRetries: number = 3) {
    // Sweep failed queue logs and retry dispatches
  }
}`
                  },
                  {
                    name: "notifications.repository.ts",
                    type: "file",
                    description: "Queries the NotificationTemplate and NotificationLog tables with built-in indexing and retry filters.",
                    code: `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFailedLogsForRetry(maxRetries: number) {
    return this.prisma.notificationLog.findMany({
      where: { status: 'FAILED', retryCount: { lt: maxRetries } }
    });
  }
}`
                  }
                ]
              },
              {
                name: "dashboard",
                type: "folder",
                children: [
                  {
                    name: "dashboard.module.ts",
                    type: "file",
                    description: "Ties the Dashboard Controller, Service, and Repository together with NestJS Module decorators.",
                    code: `import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [DashboardController],
  providers: [
    DashboardService,
    DashboardRepository,
    PrismaService,
    AuditService,
  ],
  exports: [DashboardService, DashboardRepository],
})
export class DashboardModule {}`
                  },
                  {
                    name: "dashboard.controller.ts",
                    type: "file",
                    description: "Exposes REST endpoints to query project health, progress S-curves, AI simulated delays, labor productivity, trade-wise volumes, and activities.",
                    code: `import { Controller, Get, Param, Query, UseGuards, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { AuthGuard } from '../../common/auth/auth.guard';

@ApiTags('Dashboard Module')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get high-level dashboard KPIs and project list' })
  async getSummary(@Query() query: DashboardQueryDto) {
    return this.service.getOrganizationSummary(query.organizationId || 'org-123');
  }

  @Get('project-health/:projectId')
  @ApiOperation({ summary: 'Get extensive project health metrics' })
  async getProjectHealth(@Param('projectId') projectId: string) {
    return this.service.getProjectHealth(projectId);
  }

  @Get('progress/:projectId')
  @ApiOperation({ summary: 'Get progress S-Curve series data' })
  async getProjectProgress(@Param('projectId') projectId: string, @Query() query: DashboardQueryDto) {
    return this.service.getProjectProgress(projectId, query);
  }

  @Get('delays/:projectId')
  @ApiOperation({ summary: 'Calculate delay predictions & site bottlenecks' })
  async getProjectDelays(@Param('projectId') projectId: string) {
    return this.service.getProjectDelays(projectId);
  }

  @Get('productivity/:projectId')
  @ApiOperation({ summary: 'Get site labor productivity and EVM metrics' })
  async getProductivity(@Param('projectId') projectId: string) {
    return this.service.getProductivity(projectId);
  }

  @Get('trades/:projectId')
  @ApiOperation({ summary: 'Get comprehensive physical trade breakdowns' })
  async getTradesSummary(@Param('projectId') projectId: string, @Query() query: DashboardQueryDto) {
    return this.service.getTradesSummary(projectId, query);
  }
}`
                  },
                  {
                    name: "dashboard.service.ts",
                    type: "file",
                    description: "Performs complex calculations for Project Health Scores, EVM (SPI/CPI), S-Curve deviations, and trade-wise aggregate completion rates.",
                    code: `import { Injectable, Logger } from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';

@Injectable()
export class DashboardService {
  constructor(private readonly repo: DashboardRepository) {}

  async getOrganizationSummary(orgId: string) {
    // Calculates projects, cumulative budget, average progress
  }

  async getProjectHealth(projectId: string) {
    // Determines health scores, active anomalies, and custom KPIs
  }

  async getProjectProgress(projectId: string, query: any) {
    // Compiles actual vs planned construction volume S-curves
  }

  async getProjectDelays(projectId: string) {
    // Schedules risk predictions and trade bottleneck identification
  }

  async getProductivity(projectId: string) {
    // Calculates Earned Value Management (EVM) SPI and CPI scores
  }

  async getTradesSummary(projectId: string, query: any) {
    // Aggregates installed quantities and completion rates across trades
  }
}`
                  },
                  {
                    name: "dashboard.repository.ts",
                    type: "file",
                    description: "Queries multi-table databases (Project, Milestone, ProgressRecord, ProgressSnapshot, AiJob, NotificationLog) to pull fresh data aggregates.",
                    code: `import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getProjectHealthMetrics(projectId: string) {
    // Fetches projects, milestones, progress records and snapshots
  }
}`
                  }
                ]
              },
              {
                name: "audit",
                type: "folder",
                children: [
                  {
                    name: "audit.module.ts",
                    type: "file",
                    description: "Ties the Audit Controller, Service, and Repository together with NestJS Module decorators.",
                    code: `import { Module } from '@nestjs/common';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditRepository } from './audit.repository';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AuditService as CommonAuditService } from '../../common/audit/audit.service';

@Module({
  controllers: [AuditController],
  providers: [
    AuditService,
    AuditRepository,
    PrismaService,
    CommonAuditService,
  ],
  exports: [AuditService, AuditRepository],
})
export class AuditModule {}`
                  },
                  {
                    name: "audit.controller.ts",
                    type: "file",
                    description: "Exposes REST API endpoints for querying core audit logs, user/project activities, computer vision pipelines, report generations, and performing state restorations.",
                    code: `import { Controller, Get, Post, Param, Query, UseGuards, Req, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';

@ApiTags('Audit Module')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly service: AuditService) {}

  @Get('logs')
  @Permissions('read:audit')
  @ApiOperation({ summary: 'Query paginated core audit log entries across all database entities' })
  async getLogs(@Query() query: AuditQueryDto) {
    return this.service.getLogs(query);
  }

  @Get('history/:tableName/:recordId')
  @Permissions('read:audit')
  @ApiOperation({ summary: 'Compile chronologically sorted revision snapshots for a specific record' })
  async getHistory(@Param('tableName') tableName: string, @Param('recordId') recordId: string) {
    return this.service.getHistory(tableName, recordId);
  }

  @Post('restore/:id')
  @HttpCode(HttpStatus.OK)
  @Permissions('write:audit')
  @ApiOperation({ summary: 'Restore record back to its exact JSON state defined in specified historical log' })
  async restoreLog(@Param('id') id: string, @Req() req: any) {
    const userId = req.headers['x-user-id'] as string;
    return this.service.restoreLog(id, userId);
  }
}`
                  },
                  {
                    name: "audit.service.ts",
                    type: "file",
                    description: "Orchestrates querying, user and project activity compilation, AI task activity parsing, and executes atomic reversible record restorations.",
                    code: `import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AuditRepository } from './audit.repository';
import { AuditService as CommonAuditService } from '../../common/audit/audit.service';
import { AuditQueryDto } from './dto/audit-query.dto';

@Injectable()
export class AuditService {
  constructor(
    private readonly auditRepository: AuditRepository,
    private readonly commonAudit: CommonAuditService,
  ) {}

  async restoreLog(auditId: string, requestUserId?: string) {
    const log = await this.auditRepository.findOne(auditId);
    const targetState = log.oldValues || log.newValues;
    if (!targetState) {
      throw new BadRequestException('This audit log entry does not contain a restorable snapshot.');
    }
    const restoredRecord = await this.auditRepository.restoreState(log.tableName, log.recordId, targetState);
    await this.commonAudit.log({
      action: 'RESTORE',
      tableName: log.tableName,
      recordId: log.recordId,
      oldValues: log.newValues || null,
      newValues: targetState,
      userId: requestUserId,
    });
    return { success: true, restoredRecord };
  }
}`
                  },
                  {
                    name: "audit.repository.ts",
                    type: "file",
                    description: "Queries multi-table database logs and applies dynamic, transaction-safe database restorations on specific historical revision snapshots.",
                    code: `import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: any) {
    // Queries audit logs with full dynamic filters
  }

  async restoreState(tableName: string, recordId: string, state: any) {
    const modelName = tableName.toLowerCase();
    const prismaModel = (this.prisma as any)[modelName];
    return prismaModel.upsert({
      where: { id: recordId },
      update: state,
      create: { id: recordId, ...state },
    });
  }
}`
                  }
                ]
              },
              {
                name: "permissions",
                type: "folder",
                children: [
                  {
                    name: "permissions.guard.ts",
                    type: "file",
                    description: "Role-Based Access Control (RBAC) guard verifying token privileges.",
                    code: `import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    return requiredRoles.includes(user?.role);
  }
}`
                  }
                ]
              },
              {
                name: "scheduling",
                type: "folder",
                children: [
                  {
                    name: "scheduling.service.ts",
                    type: "file",
                    description: "Defines cron intervals to trigger periodic sweeps and report deliveries.",
                    code: `import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReportsService } from '../reports/reports.service';

@Injectable()
export class SchedulingService {
  constructor(private readonly reportsService: ReportsService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6PM)
  async handleDailyDistribution() {
    console.log('Running daily 18:00 RERA reports compilation...');
    await this.reportsService.compilePdfReport('proj-blr-02');
  }
}`
                  }
                ]
              }
            ]
          },
          {
            name: "storage",
            type: "folder",
            children: [
              {
                name: "storage.service.ts",
                type: "file",
                description: "Manages encrypted cloud storage interfaces for video surveys.",
                code: `import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  async uploadFile(path: string, buffer: Buffer): Promise<string> {
    console.log(\`Uploading \${buffer.length} bytes to cloud path \${path}\`);
    // Secure cloud bucket adapter logic goes here
    return \`https://storage.buildtrace.in/\${path}\`;
  }
}`
              }
            ]
          },
          {
            name: "queues",
            type: "folder",
            children: [
              {
                name: "queues.service.ts",
                type: "file",
                description: "Redis-backed BullMQ message queue scheduler for compute-heavy CV sweeps.",
                code: `import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@Injectable()
export class QueuesService {
  constructor(@InjectQueue('ai-processing') private readonly aiQueue: Queue) {}

  async addAiJob(data: { videoUrl: string; roomId: string; model: string }) {
    return this.aiQueue.add('analyze-survey', data, {
      attempts: 3,
      backoff: 5000,
    });
  }
}`
              }
            ]
          }
        ]
      }
    ]
  };

  // Tree Renderer Helper
  const renderTree = (node: FileNode, currentPath: string = "") => {
    const path = currentPath ? `${currentPath}/${node.name}` : node.name;
    const isFolder = node.type === "folder";
    const isExpanded = expandedFolders[path];

    if (isFolder) {
      return (
        <div key={path} className="ml-3 font-mono text-xs select-none">
          <div
            onClick={() => toggleFolder(path)}
            className="flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-slate-800 hover:text-white cursor-pointer text-slate-300 transition"
          >
            {isExpanded ? <FolderOpen className="w-4 h-4 text-indigo-400 shrink-0" /> : <Folder className="w-4 h-4 text-slate-400 shrink-0" />}
            <span className="font-bold">{node.name}/</span>
          </div>
          {isExpanded && node.children && (
            <div className="border-l border-slate-800 ml-2 pl-2">
              {node.children.map(child => renderTree(child, path))}
            </div>
          )}
        </div>
      );
    } else {
      const isSelected = selectedFileName === node.name;
      return (
        <div
          key={path}
          onClick={() => {
            setSelectedFileCode(node.code || "");
            setSelectedFileName(node.name);
          }}
          className={`ml-3 font-mono text-xs py-1 px-1.5 rounded hover:bg-slate-800 hover:text-indigo-300 cursor-pointer flex items-center justify-between gap-2 transition ${
            isSelected ? "bg-indigo-950/80 text-indigo-300 border-l border-indigo-500" : "text-slate-400"
          }`}
        >
          <div className="flex items-center gap-1.5 truncate">
            <FileCode className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="truncate">{node.name}</span>
          </div>
          {node.description && (
            <span className="text-[10px] text-slate-600 truncate max-w-[120px] lg:max-w-[180px] font-sans">
              {node.description}
            </span>
          )}
        </div>
      );
    }
  };

  // Find a file to initialize code viewer
  React.useEffect(() => {
    if (!selectedFileName) {
      setSelectedFileCode(
        folderTree.children?.[0].children?.[0].children?.[0].children?.[1].code || ""
      );
      setSelectedFileName("auth.service.ts");
    }
  }, []);

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col font-sans">
      
      {/* 1. SUITE HEADER */}
      <div className="bg-slate-900 text-white p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-[9px] rounded uppercase tracking-wider">
              production-ready architect
            </span>
            <h2 className="text-lg font-black tracking-tight">NestJS Enterprise Backend blueprint</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Explore decoupled architectural modules, BullMQ queue nodes, type-safe repositories, and inversion of control diagrams.
          </p>
        </div>

        {/* Info badges */}
        <div className="flex items-center gap-3 text-xs font-mono shrink-0">
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">framework version</span>
            <span className="text-white font-bold">NestJS v10.x</span>
          </div>
          <div className="bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">
            <span className="text-[9px] text-slate-500 block uppercase font-bold">ORM standard</span>
            <span className="text-indigo-400 font-bold">TypeORM / PostgreSQL</span>
          </div>
        </div>
      </div>

      {/* 2. SUB NAVIGATION TABS */}
      <div className="bg-slate-50 border-b border-slate-200 px-6 py-2.5 flex flex-wrap gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("structure")}
          className={`px-3 py-1.5 rounded-md transition flex items-center gap-2 ${
            activeTab === "structure"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <FolderOpen className="w-4 h-4 text-indigo-500" />
          <span>Folder Structure & Code Gen</span>
        </button>

        <button
          onClick={() => setActiveTab("di")}
          className={`px-3 py-1.5 rounded-md transition flex items-center gap-2 ${
            activeTab === "di"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <Share2 className="w-4 h-4 text-indigo-500" />
          <span>Dependency Injection Visualizer</span>
        </button>

        <button
          onClick={() => setActiveTab("components")}
          className={`px-3 py-1.5 rounded-md transition flex items-center gap-2 ${
            activeTab === "components"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-500" />
          <span>Architecture Layers Explainer</span>
        </button>

        <button
          onClick={() => setActiveTab("explain")}
          className={`px-3 py-1.5 rounded-md transition flex items-center gap-2 ${
            activeTab === "explain"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-500" />
          <span>Module Mechanics Checklist</span>
        </button>
      </div>

      {/* 3. ACTIVE TAB CONTENTS */}
      <div className="min-h-[500px] flex-1">
        
        {/* TAB 1: INTERACTIVE STRUCTURE TREE & CODE FILE VIEWER */}
        {activeTab === "structure" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
            
            {/* Folder Explorer Column (5 columns) */}
            <div className="lg:col-span-5 bg-slate-950 border-r border-slate-800 p-4 flex flex-col gap-4 overflow-y-auto max-h-[600px]">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  Source Code Tree explorer
                </span>
                <span className="text-[9px] text-slate-600 font-mono">16 Modules compiled</span>
              </div>

              {/* Tree component render */}
              <div className="flex flex-col gap-0.5">
                {renderTree(folderTree)}
              </div>
            </div>

            {/* Code Mirror Previewer Column (7 columns) */}
            <div className="lg:col-span-7 bg-slate-900 p-5 flex flex-col gap-4 overflow-y-auto max-h-[600px]">
              <div className="flex justify-between items-center border-b border-slate-800 pb-2 text-xs">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  <span className="font-mono text-slate-100 font-bold">{selectedFileName}</span>
                </div>

                <button
                  onClick={() => handleCopy(selectedFileCode || "")}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] font-bold text-white flex items-center gap-1.5 transition"
                >
                  {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  Copy Source Code
                </button>
              </div>

              {/* Readonly Code View */}
              <pre className="p-4 bg-slate-950 rounded-lg text-[11px] font-mono leading-relaxed text-slate-300 overflow-x-auto select-all">
                {selectedFileCode}
              </pre>

              {/* Helper explanation bar */}
              <div className="bg-slate-850/80 border border-slate-800 p-3.5 rounded-lg text-xs leading-relaxed text-slate-400 flex gap-2">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <p>
                  This NestJS backend blueprint is designed for multitenant physical survey applications. 
                  It includes <strong>StorageService</strong> to pipe mp4 streams directly to secure object storage, 
                  and <strong>QueuesService</strong> to asynchronously schedule YOLO segmentations without blocking main HTTP request threads.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: INTERACTIVE DEPENDENCY INJECTION STEPPING ENGINE */}
        {activeTab === "di" && (
          <div className="p-6 flex flex-col gap-6 animate-fade-in text-xs">
            
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-950">Inversion of Control (IoC) & Injection Flow</h3>
              <p className="text-slate-500 mt-0.5">Step through the NestJS runtime system to visualize how classes declare and inherit dependency injection targets.</p>
            </div>

            {/* Stepper buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { id: "controller", label: "1. Controller Entry", desc: "@Controller() routes mapper" },
                { id: "service", label: "2. Business Service", desc: "@Injectable() Core Logic" },
                { id: "repository", label: "3. Repository Provider", desc: "Decoupled Data Queries" },
                { id: "db", label: "4. Database Model", desc: "TypeORM schema mapping" }
              ].map(step => (
                <button
                  key={step.id}
                  onClick={() => setDiStep(step.id as any)}
                  className={`p-3 text-left rounded-lg border transition ${
                    diStep === step.id
                      ? "bg-indigo-50 border-indigo-300 shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <span className={`font-bold block ${diStep === step.id ? "text-indigo-800" : "text-slate-700"}`}>
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">{step.desc}</span>
                </button>
              ))}
            </div>

            {/* Interactive flow diagram layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Dynamic code sample */}
              <div className="lg:col-span-6 bg-slate-900 text-slate-300 p-5 rounded-xl border border-slate-800 font-mono flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-black tracking-wider block mb-2">
                    {diStep === "controller" && "AuthController definition"}
                    {diStep === "service" && "AuthService injection profile"}
                    {diStep === "repository" && "UsersRepository decoupling Layer"}
                    {diStep === "db" && "PostgreSQL database entity model"}
                  </span>

                  <pre className="text-[10px] leading-relaxed text-indigo-300 overflow-x-auto">
                    {diStep === "controller" && `// auth.controller.ts
@Controller('auth')
export class AuthController {
  // NestJS automatically injects AuthService singleton here!
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}`}
                    {diStep === "service" && `// auth.service.ts
@Injectable() // Registers this class with NestJS IoC container
export class AuthService {
  constructor(
    private readonly usersService: UsersService, // Injected dependency
    private readonly jwtService: JwtService,     // Injected token compiler
  ) {}

  async validateUser(email: string, pass: string) { ... }
}`}
                    {diStep === "repository" && `// users.repository.ts
@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User> // Direct TypeORM adapter
  ) {}

  async findByEmail(email: string) {
    return this.repo.findOne({ where: { email } });
  }
}`}
                    {diStep === "db" && `// user.entity.ts
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  role: string;
}`}
                  </pre>
                </div>

                <div className="border-t border-slate-800 pt-3 mt-4 text-[10px] text-slate-400">
                  {diStep === "controller" && "Controllers should be slim. They only validate inputs via DTO validation constraints and hand work off to services."}
                  {diStep === "service" && "Services contain the core domain business. They are declared with @Injectable() and handled as application singletons."}
                  {diStep === "repository" && "Repositories decouple services from TypeORM/SQL APIs. If you switch storage backends, you only modify this file."}
                  {diStep === "db" && "Entities represent direct tables mapping. Decorated variables are mapped to SQL structures."}
                </div>
              </div>

              {/* Visual Flow diagram (6 columns) */}
              <div className="lg:col-span-6 bg-slate-50 border border-slate-200 p-5 rounded-xl flex flex-col gap-4 justify-between">
                <div>
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider border-b border-slate-100 pb-1.5">
                    IoC Dependency Resolution Graph
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">NestJS builds an internal directed acyclic graph (DAG) to resolve dependencies at server boot time:</p>
                </div>

                <div className="flex flex-col gap-3 font-mono text-[11px] py-4">
                  
                  {/* Step 1 Node */}
                  <div className={`p-2 rounded border flex items-center justify-between transition-all duration-300 ${
                    diStep === "controller" ? "bg-indigo-600 text-white border-indigo-700 scale-[1.02]" : "bg-white border-slate-200 text-slate-600"
                  }`}>
                    <span>HTTP Client request</span>
                    <span className="text-[9px] uppercase font-bold">1. Controller Entry</span>
                  </div>

                  <div className="flex justify-center text-slate-400 py-0.5">
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </div>

                  {/* Step 2 Node */}
                  <div className={`p-2 rounded border flex items-center justify-between transition-all duration-300 ${
                    diStep === "service" ? "bg-indigo-600 text-white border-indigo-700 scale-[1.02]" : "bg-white border-slate-200 text-slate-600"
                  }`}>
                    <span>AuthService (Business logic)</span>
                    <span className="text-[9px] uppercase font-bold">2. Injectable Service</span>
                  </div>

                  <div className="flex justify-center text-slate-400 py-0.5">
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </div>

                  {/* Step 3 Node */}
                  <div className={`p-2 rounded border flex items-center justify-between transition-all duration-300 ${
                    diStep === "repository" ? "bg-indigo-600 text-white border-indigo-700 scale-[1.02]" : "bg-white border-slate-200 text-slate-600"
                  }`}>
                    <span>UsersRepository (DB decoupling)</span>
                    <span className="text-[9px] uppercase font-bold">3. Repository Layer</span>
                  </div>

                  <div className="flex justify-center text-slate-400 py-0.5">
                    <ChevronDown className="w-4 h-4 animate-bounce" />
                  </div>

                  {/* Step 4 Node */}
                  <div className={`p-2 rounded border flex items-center justify-between transition-all duration-300 ${
                    diStep === "db" ? "bg-indigo-600 text-white border-indigo-700 scale-[1.02]" : "bg-white border-slate-200 text-slate-600"
                  }`}>
                    <span>PostgreSQL Database Table</span>
                    <span className="text-[9px] uppercase font-bold">4. Database Entity</span>
                  </div>

                </div>

                <div className="bg-slate-950 text-slate-300 p-3 rounded-lg text-[11px] leading-relaxed">
                  <span className="font-bold text-indigo-400 block mb-1">Inversion of Control (IoC) explanation:</span>
                  Rather than classes manually instantiating their database connectors using <code>new TypeORMPostgres()</code>, the NestJS container manages all lifetimes and wires singletons together. This allows for clean unit testing and mock insertions!
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 3: LAYERS EXPLAINER */}
        {activeTab === "components" && (
          <div className="p-6 flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
            
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-950">Architectural Core Components</h3>
              <p className="text-slate-500 mt-0.5">Understanding Modules, Providers, Controllers, and Decoupled Repositories.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col gap-3">
                <div className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-700 w-fit rounded-lg">
                  <Grid className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-slate-900">NestJS Modules (@Module)</h4>
                <p className="text-slate-500">
                  Modules serve as cohesive boundary markers for related features. They declare which controllers parse routes, which providers are initialized, and which internal singletons are exported to other modules (such as <code>UsersModule</code> exporting <code>UsersService</code> to <code>AuthModule</code>).
                </p>
                <div className="mt-auto pt-3 border-t border-slate-100 text-[10px] font-mono text-indigo-600">
                  Example: <code>src/modules/auth/auth.module.ts</code>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col gap-3">
                <div className="p-2 bg-emerald-50 border border-emerald-100 text-emerald-700 w-fit rounded-lg">
                  <Cpu className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-slate-900">Providers & Services (@Injectable)</h4>
                <p className="text-slate-500">
                  Providers encapsulate the core algorithmic business rules of the application. They retrieve raw materials metrics, evaluate S-curve percentages, verify stirrup counts, and compile documents. Providers are wired as reusable singletons.
                </p>
                <div className="mt-auto pt-3 border-t border-slate-100 text-[10px] font-mono text-emerald-600">
                  Example: <code>src/modules/progress/progress.service.ts</code>
                </div>
              </div>

              <div className="bg-white border border-slate-200 p-5 rounded-xl flex flex-col gap-3">
                <div className="p-2 bg-amber-50 border border-amber-100 text-amber-700 w-fit rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <h4 className="font-black text-sm text-slate-900">Repository Pattern</h4>
                <p className="text-slate-500">
                  Repositories isolate services from TypeORM, Prisma, or SQL queries. By encapsulating database interactions (e.g. <code>UsersRepository.findByEmail()</code>) rather than putting raw queries inside the service, the core business tier remains completely untied to the storage engine.
                </p>
                <div className="mt-auto pt-3 border-t border-slate-100 text-[10px] font-mono text-amber-600">
                  Example: <code>src/modules/users/users.repository.ts</code>
                </div>
              </div>

            </div>

            {/* Dynamic Queue & Storage Explanation Block */}
            <div className="bg-slate-900 text-white p-5 rounded-xl flex flex-col md:flex-row gap-5 items-start">
              <Zap className="w-8 h-8 text-amber-400 shrink-0 mt-1" />
              <div>
                <h4 className="font-black text-sm text-white">How Background Job Queues Handle Massive Video photogrammetry surveys</h4>
                <p className="text-slate-300 mt-1 text-[11px] leading-relaxed">
                  Uploading high-res drone photogrammetry scans (often &gt; 100MB) requires substantial parsing time. If the backend processed this directly inside the HTTP thread loop, the API would timeout. 
                  Instead, the <strong>VideosService</strong> writes the video stream straight to private cloud buckets via <strong>StorageService</strong>, and places an <code>analyze-survey</code> task descriptor into a Redis queue managed by <strong>QueuesService</strong>. 
                  An isolated Python worker node picks up the task asynchronously, processes rebar spacing with PyTorch, and dispatches progress updates back via WebSockets.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SPECIFIC MODULE CHECKLIST */}
        {activeTab === "explain" && (
          <div className="p-6 flex flex-col gap-6 animate-fade-in text-xs leading-relaxed">
            
            <div className="border-b border-slate-200 pb-3">
              <h3 className="text-base font-black text-slate-950">Modular Architecture Checklist</h3>
              <p className="text-slate-500 mt-0.5">A complete summary of requirements, features, and database relations for all 16 target backend modules.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Module cards */}
              {[
                { title: "Auth Module", icon: <Shield className="w-4 h-4 text-indigo-500" />, desc: "Handles session encryption, bcrypt validations, JWT token lifecycle, and cryptographic cookies." },
                { title: "Users Module", icon: <Users className="w-4 h-4 text-indigo-500" />, desc: "Indexes enterprise user profiles, operator credentials, emails, and global RERA system access levels." },
                { title: "Organizations Module", icon: <Building className="w-4 h-4 text-indigo-500" />, desc: "Tracks multitenant organizations, parent enterprises, and physical site allocation tags." },
                { title: "Projects Module", icon: <Layers className="w-4 h-4 text-indigo-500" />, desc: "Covers financial limits, construction portfolio budgets, safety workdays, and overall timelines." },
                { title: "Buildings Module", icon: <Building className="w-4 h-4 text-indigo-500" />, desc: "Registers concrete blocks, residential towers, construction footprint scopes, and active zones." },
                { title: "Floors Module", icon: <Layers className="w-4 h-4 text-indigo-500" />, desc: "Manages tier offset, columns configuration grid, and volumetric concrete pours schedules." },
                { title: "Rooms Module", icon: <Grid className="w-4 h-4 text-indigo-500" />, desc: "Segments floors into datacenter corridors, wings, cores, and physical camera areas." },
                { title: "Videos Module", icon: <Video className="w-4 h-4 text-indigo-500" />, desc: "Handles raw MP4 uploads, private storage paths generation, and background job delegation." },
                { title: "AI Module", icon: <Cpu className="w-4 h-4 text-indigo-500" />, desc: "Queries background CUDA engines to analyze rebar density and check stirrup alignments." },
                { title: "Progress Module", icon: <TrendingUp className="w-4 h-4 text-indigo-500" />, desc: "Calculates planned vs actual project completion and logs volumetric materials inventory." },
                { title: "Reports Module", icon: <FileText className="w-4 h-4 text-indigo-500" />, desc: "Compiles static PDFs, RERA certification documents, and high-res image catalogs." },
                { title: "Notifications Module", icon: <Bell className="w-4 h-4 text-indigo-500" />, desc: "Dispatches critical security and spacing anomaly updates via SMTP emails and push endpoints." },
                { title: "Permissions Module", icon: <Shield className="w-4 h-4 text-indigo-500" />, desc: "Enforces Role-Based Access Control (RBAC) across endpoints through global Guard interceptors." },
                { title: "Scheduling Module", icon: <Clock className="w-4 h-4 text-indigo-500" />, desc: "Fires background cron workers to trigger periodic sweeps and daily report compiles." },
                { title: "Queues Module", icon: <Zap className="w-4 h-4 text-indigo-500" />, desc: "Orchestrates BullMQ Redis streams to balance PyTorch computer vision worker loads." },
                { title: "Storage Module", icon: <Database className="w-4 h-4 text-indigo-500" />, desc: "Interacts with secure cloud objects storage, generating private upload streams." },
                { title: "Audit Module", icon: <Activity className="w-4 h-4 text-indigo-500" />, desc: "Tracks full-fidelity entity changes, user logins, AI task logs, and supports dynamic, reversible record restorations." }
              ].map((mod, idx) => (
                <div key={idx} className="p-3 bg-slate-50 hover:bg-slate-100/50 border border-slate-200 rounded-lg flex items-start gap-2.5 transition">
                  <div className="p-1.5 bg-white border border-slate-200 rounded-md shrink-0">
                    {mod.icon}
                  </div>
                  <div>
                    <span className="font-bold text-slate-800">{mod.title}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{mod.desc}</p>
                  </div>
                </div>
              ))}

            </div>

          </div>
        )}

      </div>

    </div>
  );
}
