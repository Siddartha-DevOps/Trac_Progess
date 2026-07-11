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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiHeader, ApiBody } from '@nestjs/swagger';
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
@Controller('floors')
export class FloorsController {
  constructor(private readonly service: FloorsService) {}

  @Post()
  @Permissions('building.update')
  @ApiOperation({
    summary: 'Create a new floor level',
    description: 'Initializes a new floor level within a parent building tower, checking for level or name conflicts.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: FloorResponseDto, description: 'Floor successfully created.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parent Building ID not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Floor name or level number conflicts with an existing floor.' })
  async create(@Body() createDto: CreateFloorDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.createFloor(createDto, userId);
  }

  @Get()
  @Permissions('building.read')
  @ApiOperation({
    summary: 'Find and filter floor levels',
    description: 'Retrieves a list of floors filtered by parent building, status, searching, and pagination page.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedFloorResponseDto })
  async findAll(@Query() query: QueryFloorDto) {
    return this.service.findAllFloors(query);
  }

  @Post('reorder')
  @HttpCode(HttpStatus.OK)
  @Permissions('building.update')
  @ApiOperation({
    summary: 'Re-order vertical floor lists',
    description: 'Bulk updates the sorting sequence order of multiple floors sequentially.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        orderedIds: {
          type: 'array',
          items: { type: 'string' },
          example: ['f1-id', 'f2-id', 'f3-id'],
        },
      },
    },
  })
  @ApiResponse({ status: HttpStatus.OK, description: 'Floors successfully re-ordered.' })
  async reorder(@Body('orderedIds') orderedIds: string[], @Req() req: any) {
    const userId = req.user?.id;
    return this.service.reorderFloors(orderedIds, userId);
  }

  @Get(':id')
  @Permissions('building.read')
  @ApiOperation({
    summary: 'Find single floor by ID',
    description: 'Retrieves comprehensive metadata and properties for a specific floor.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: FloorResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Floor not found.' })
  async findOne(@Param('id') id: string) {
    return this.service.findFloorById(id);
  }

  @Patch(':id')
  @Permissions('building.update')
  @ApiOperation({
    summary: 'Update floor attributes',
    description: 'Allows editing of name, description, level index, sequencing order, area, and metadata block.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: FloorResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Floor not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Updated name or level index duplicates an existing floor.' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateFloorDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.updateFloor(id, updateDto, userId);
  }

  @Delete(':id')
  @Permissions('building.update')
  @ApiOperation({
    summary: 'Soft-delete a floor level',
    description: 'Flags a floor as soft-deleted by updating deletedAt timestamp.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: FloorResponseDto, description: 'Floor successfully soft-deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Floor not found.' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.softDeleteFloor(id, userId);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @Permissions('building.update')
  @ApiOperation({
    summary: 'Restore a soft-deleted floor level',
    description: 'Resets the deletedAt timestamp back to null to re-enable floor visibility.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: FloorResponseDto, description: 'Floor successfully restored.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Floor not found.' })
  async restore(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.restoreFloor(id, userId);
  }
}
