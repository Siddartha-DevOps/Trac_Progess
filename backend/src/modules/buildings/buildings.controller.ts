import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiHeader } from '@nestjs/swagger';
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { QueryBuildingDto } from './dto/query-building.dto';
import { BuildingResponseDto, PaginatedBuildingResponseDto } from './dto/building-response.dto';
import { ProjectBuildingsAnalyticsResponseDto } from './dto/building-analytics-response.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';

@ApiTags('Buildings Module')
@ApiBearerAuth()
@ApiHeader({
  name: 'x-user-id',
  description: 'Simulated User ID for development testing',
  required: false,
})
@ApiHeader({
  name: 'x-user-role',
  description: 'Simulated User Role (Admin, SiteEngineer, Auditor)',
  required: false,
})
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly service: BuildingsService) {}

  @Post()
  @Permissions('building.create')
  @ApiOperation({
    summary: 'Create a new building structure',
    description: 'Initializes a new building associated with a parent project, checking for unique naming.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: BuildingResponseDto, description: 'Building successfully created.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Associated Project ID does not exist.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Building name already exists within the project.' })
  async create(@Body() createDto: CreateBuildingDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.createBuilding(createDto, userId);
  }

  @Get()
  @Permissions('building.read')
  @ApiOperation({
    summary: 'Find and filter buildings',
    description: 'Retrieves a list of buildings using filters like project, status, type, and text searches.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedBuildingResponseDto })
  async findAll(@Query() query: QueryBuildingDto) {
    return this.service.findAllBuildings(query);
  }

  @Get('analytics/:projectId')
  @Permissions('building.read')
  @ApiOperation({
    summary: 'Retrieve project-specific building analytics',
    description: 'Calculates floor sums, total area, and breakdowns of status and usage types.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: ProjectBuildingsAnalyticsResponseDto })
  @ApiParam({ name: 'projectId', description: 'The parent project unique identifier (UUID v4)' })
  async getAnalytics(@Param('projectId') projectId: string) {
    return this.service.getProjectBuildingsAnalytics(projectId);
  }

  @Get(':id')
  @Permissions('building.read')
  @ApiOperation({
    summary: 'Find building by ID',
    description: 'Retrieves metadata, location, and structural info for a single building.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: BuildingResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Building with specified ID not found.' })
  async findOne(@Param('id') id: string) {
    return this.service.findBuildingById(id);
  }

  @Patch(':id')
  @Permissions('building.update')
  @ApiOperation({
    summary: 'Update building properties',
    description: 'Allows updating details, metadata, GPS coordinates, or location of a building.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: BuildingResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Building with specified ID not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Updated name conflicts with another building.' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateBuildingDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.updateBuilding(id, updateDto, userId);
  }

  @Delete(':id')
  @Permissions('building.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Soft-delete building',
    description: 'Sets a deletedAt timestamp on the building to temporarily archive it.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: BuildingResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Building with specified ID not found.' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.softDeleteBuilding(id, userId);
  }

  @Post(':id/restore')
  @Permissions('building.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore soft-deleted building',
    description: 'Resets the deletedAt field of a soft-deleted building to make it active again.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: BuildingResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Building with specified ID not found.' })
  async restore(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.restoreBuilding(id, userId);
  }
}
