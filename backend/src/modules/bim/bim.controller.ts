import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, HttpCode, HttpStatus } from '@nestjs/common';
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
}
