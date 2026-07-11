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
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Post()
  @Permissions('building.update')
  @ApiOperation({
    summary: 'Create a new room',
    description: 'Initializes a new room within a parent floor, checking for name conflicts.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: RoomResponseDto, description: 'Room successfully created.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Parent Floor ID not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Room name conflicts with an existing room on same floor.' })
  async create(@Body() createDto: CreateRoomDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.createRoom(createDto, userId);
  }

  @Get()
  @Permissions('building.read')
  @ApiOperation({
    summary: 'Find and filter rooms',
    description: 'Retrieves a list of rooms filtered by parent floor, status, category, searching, and pagination page.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedRoomResponseDto })
  async findAll(@Query() query: QueryRoomDto) {
    return this.service.findAllRooms(query);
  }

  @Get(':id')
  @Permissions('building.read')
  @ApiOperation({
    summary: 'Find single room by ID',
    description: 'Retrieves comprehensive metadata and properties for a specific room.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: RoomResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Room not found.' })
  async findOne(@Param('id') id: string) {
    return this.service.findRoomById(id);
  }

  @Patch(':id')
  @Permissions('building.update')
  @ApiOperation({
    summary: 'Update room attributes',
    description: 'Allows editing of name, description, category, status, area, height, perimeter, geometry, and metadata.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: RoomResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Room not found.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Updated name duplicates an existing room.' })
  async update(@Param('id') id: string, @Body() updateDto: UpdateRoomDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.updateRoom(id, updateDto, userId);
  }

  @Delete(':id')
  @Permissions('building.update')
  @ApiOperation({
    summary: 'Soft-delete a room',
    description: 'Flags a room as soft-deleted by updating deletedAt timestamp.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: RoomResponseDto, description: 'Room successfully soft-deleted.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Room not found.' })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.softDeleteRoom(id, userId);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @Permissions('building.update')
  @ApiOperation({
    summary: 'Restore a soft-deleted room',
    description: 'Resets the deletedAt timestamp back to null to re-enable room visibility.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: RoomResponseDto, description: 'Room successfully restored.' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Room not found.' })
  async restore(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.restoreRoom(id, userId);
  }
}
