import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { QueryOrganizationDto } from './dto/query-organization.dto';
import {
  OrganizationResponseDto,
  PaginatedOrganizationResponseDto,
} from './dto/organization-response.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { RolesGuard } from '../../common/auth/roles.guard';
import { Roles } from '../../common/auth/roles.decorator';

@ApiTags('Organizations')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('api/v1/organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles('Admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new multi-tenant organization',
    description: 'Registers a new real estate developer tenant on the system. Restricted to Admin profiles.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The organization has been successfully created and audited.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Resource conflict. The URL slug or RERA license is already registered in the system.',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden. Your security clearance is insufficient.',
  })
  create(@Body() createDto: CreateOrganizationDto, @Req() req: any) {
    const actorUserId = req.user?.id;
    return this.organizationsService.create(createDto, actorUserId);
  }

  @Get()
  @Roles('Admin', 'SiteEngineer', 'Auditor')
  @ApiOperation({
    summary: 'Retrieve all organizations with paginated filters and keywords search',
    description: 'Fetch lists of corporate tenants. High-level planning logs can search by terms matching names, slugs, or RERA codes.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Fetched matching paginated records list.',
    type: PaginatedOrganizationResponseDto,
  })
  findAll(@Query() queryDto: QueryOrganizationDto) {
    return this.organizationsService.findAll(queryDto);
  }

  @Get(':id')
  @Roles('Admin', 'SiteEngineer', 'Auditor')
  @ApiOperation({
    summary: 'Retrieve a single organization by its UUID primary key',
    description: 'Fetch details for a tenant profile. Supports retrieval of active configurations.',
  })
  @ApiParam({ name: 'id', description: 'The unique organization GUID', example: 'd9b0488e-67c4-4c4c-83b3-111122223333' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization found.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Requested organization ID does not exist or has been soft-deleted.',
  })
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Get('slug/:slug')
  @Roles('Admin', 'SiteEngineer', 'Auditor')
  @ApiOperation({
    summary: 'Retrieve a single organization by its unique lowercase URL slug',
    description: 'Useful for initializing multi-tenant client subdomains on layout mount.',
  })
  @ApiParam({ name: 'slug', description: 'The unique lowercase corporate slug', example: 'lt-realty' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization matching slug found.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No matching slug found in active records.',
  })
  findOneBySlug(@Param('slug') slug: string) {
    return this.organizationsService.findOneBySlug(slug);
  }

  @Patch(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Modify details of an existing organization',
    description: 'Perform granular patch updates. Restricted to Admin operators; registers historical states in audit traces.',
  })
  @ApiParam({ name: 'id', description: 'The unique organization UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Organization records updated successfully.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Target organization ID is missing, deactivated, or deleted.',
  })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateOrganizationDto,
    @Req() req: any,
  ) {
    const actorUserId = req.user?.id;
    return this.organizationsService.update(id, updateDto, actorUserId);
  }

  @Delete(':id')
  @Roles('Admin')
  @ApiOperation({
    summary: 'Soft-delete an organization',
    description: 'Marks the record with a deletedAt timestamp. The data persists safely in tables, but is ignored by standard queries.',
  })
  @ApiParam({ name: 'id', description: 'The organization UUID to deactivate and soft-delete' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The organization has been successfully soft-deleted.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Requested organization ID is not active or has already been soft-deleted.',
  })
  softDelete(@Param('id') id: string, @Req() req: any) {
    const actorUserId = req.user?.id;
    return this.organizationsService.softDelete(id, actorUserId);
  }

  @Post(':id/restore')
  @Roles('Admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore a soft-deleted organization',
    description: 'Removes the deletedAt timestamp restriction, making the tenant record active in visual screens again.',
  })
  @ApiParam({ name: 'id', description: 'The organization UUID to restore' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'The organization has been successfully restored.',
    type: OrganizationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Target record is already active and does not require recovery.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Organization record id does not exist.',
  })
  restore(@Param('id') id: string, @Req() req: any) {
    const actorUserId = req.user?.id;
    return this.organizationsService.restore(id, actorUserId);
  }
}
