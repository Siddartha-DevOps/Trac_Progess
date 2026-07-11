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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { RbacService } from './rbac.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';
import {
  RoleResponseDto,
  PermissionResponseDto,
  PaginatedRoleResponseDto,
  PaginatedPermissionResponseDto,
  AssignmentResponseDto,
} from './dto/rbac-response.dto';

@ApiTags('Role-Based Access Control (RBAC)')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('rbac')
export class RbacController {
  constructor(private readonly rbacService: RbacService) {}

  // ==========================================
  // ROLE ENDPOINTS
  // ==========================================

  @Post('roles')
  @Permissions('rbac:roles:create')
  @ApiOperation({
    summary: 'Create a new corporate privilege role',
    description: 'Registers a completely new security role to govern organization workflows.',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: RoleResponseDto, description: 'Role successfully generated.' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Role with this name designation already exists.' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Validation or database registration error.' })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rbacService.createRole(createRoleDto);
  }

  @Get('roles')
  @Permissions('rbac:roles:read')
  @ApiOperation({
    summary: 'Search and query privilege roles',
    description: 'Retrieves a list of all active or soft-deleted privilege roles in BuildTrace.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedRoleResponseDto })
  async findAllRoles(@Query() queryRoleDto: QueryRoleDto) {
    return this.rbacService.getAllRoles(queryRoleDto);
  }

  @Get('roles/:id')
  @Permissions('rbac:roles:read')
  @ApiOperation({ summary: 'Find role by specific ID' })
  @ApiParam({ name: 'id', description: 'Role GUID UUID v4 string' })
  @ApiResponse({ status: HttpStatus.OK, type: RoleResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Role not found.' })
  async findOneRole(@Param('id') id: string) {
    return this.rbacService.getRole(id);
  }

  @Patch('roles/:id')
  @Permissions('rbac:roles:update')
  @ApiOperation({ summary: 'Update existing role description' })
  @ApiParam({ name: 'id', description: 'Role GUID UUID' })
  @ApiResponse({ status: HttpStatus.OK, type: RoleResponseDto })
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rbacService.updateRole(id, updateRoleDto);
  }

  @Delete('roles/:id')
  @Permissions('rbac:roles:delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete a privilege role' })
  @ApiParam({ name: 'id', description: 'Role GUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Soft deletion complete.' })
  async removeRole(@Param('id') id: string) {
    return this.rbacService.deleteRole(id);
  }

  @Post('roles/:id/restore')
  @Permissions('rbac:roles:update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore a soft-deleted privilege role' })
  @ApiParam({ name: 'id', description: 'Role GUID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Role successfully restored.' })
  async restoreRole(@Param('id') id: string) {
    return this.rbacService.restoreRole(id);
  }

  // ==========================================
  // PERMISSION ENDPOINTS
  // ==========================================

  @Post('permissions')
  @Permissions('rbac:permissions:create')
  @ApiOperation({
    summary: 'Register a programmatic permission key',
    description: 'Registers a standard colon syntax security permission (e.g. "anomalies:create").',
  })
  @ApiResponse({ status: HttpStatus.CREATED, type: PermissionResponseDto })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Permission name key already exists.' })
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.rbacService.createPermission(createPermissionDto);
  }

  @Get('permissions')
  @Permissions('rbac:permissions:read')
  @ApiOperation({ summary: 'Search and query programmatic permission keys' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedPermissionResponseDto })
  async findAllPermissions(@Query() queryPermissionDto: QueryPermissionDto) {
    return this.rbacService.getAllPermissions(queryPermissionDto);
  }

  @Get('permissions/:id')
  @Permissions('rbac:permissions:read')
  @ApiOperation({ summary: 'Find permission key details by ID' })
  @ApiResponse({ status: HttpStatus.OK, type: PermissionResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND })
  async findOnePermission(@Param('id') id: string) {
    return this.rbacService.getPermission(id);
  }

  @Patch('permissions/:id')
  @Permissions('rbac:permissions:update')
  @ApiOperation({ summary: 'Update programmatic permission key description' })
  @ApiResponse({ status: HttpStatus.OK, type: PermissionResponseDto })
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.rbacService.updatePermission(id, updatePermissionDto);
  }

  @Delete('permissions/:id')
  @Permissions('rbac:permissions:delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a programmatic permission key' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Permission permanently removed.' })
  async removePermission(@Param('id') id: string) {
    return this.rbacService.deletePermission(id);
  }

  // ==========================================
  // SECURITY ASSIGNMENT ENDPOINTS
  // ==========================================

  @Post('roles/:id/permissions')
  @Permissions('rbac:assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign/synchronize multiple permission keys to a Role',
    description: 'Completely synchronizes permission sets for the target role ID.',
  })
  @ApiParam({ name: 'id', description: 'Role identifier (ID or case-insensitive Name)' })
  @ApiResponse({ status: HttpStatus.OK, type: AssignmentResponseDto })
  async assignPermissionsToRole(
    @Param('id') id: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.rbacService.assignPermissionsToRole(id, assignPermissionsDto);
  }

  @Post('assign-role')
  @Permissions('rbac:assign')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign/promote a user to a specific privilege Role',
    description: 'Promotes a target user GUID to the designated role.',
  })
  @ApiResponse({ status: HttpStatus.OK, type: AssignmentResponseDto })
  async assignRoleToUser(@Body() assignRoleDto: AssignRoleDto) {
    return this.rbacService.assignRoleToUser(assignRoleDto);
  }
}
