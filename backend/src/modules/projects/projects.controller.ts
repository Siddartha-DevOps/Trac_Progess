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
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { ProjectResponseDto, PaginatedProjectResponseDto } from './dto/project-response.dto';
import { AddProjectMemberDto, UpdateProjectMemberDto, ProjectMemberResponseDto } from './dto/project-member.dto';
import { CreateProjectFileDto, ProjectFileResponseDto } from './dto/project-file.dto';
import { CreateProjectMilestoneDto, UpdateProjectMilestoneDto, ProjectMilestoneResponseDto } from './dto/project-milestone.dto';
import { ProjectAnalyticsResponseDto, ProjectDashboardResponseDto } from './dto/project-analytics-response.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { Permissions } from '../../common/auth/permissions.decorator';

@ApiTags('Projects Module')
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
@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) {}

  // ==========================================
  // PROJECT ENDPOINTS
  // ==========================================

  @Post()
  @Permissions('project.create')
  @ApiOperation({ summary: 'Create a new project', description: 'Initializes a new project for an organization.' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ProjectResponseDto })
  async create(@Body() createDto: CreateProjectDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.createProject(createDto, userId);
  }

  @Get()
  @Permissions('project.read')
  @ApiOperation({ summary: 'Find and search projects', description: 'Lists projects with optional query matching, status filter, and pagination.' })
  @ApiResponse({ status: HttpStatus.OK, type: PaginatedProjectResponseDto })
  async findAll(@Query() query: QueryProjectDto) {
    return this.service.findAllProjects(query);
  }

  @Get('dashboard/:organizationId')
  @Permissions('project.read')
  @ApiOperation({ summary: 'Retrieve organization project dashboard metrics', description: 'Retrieves totals, budget totals, and lists of high-level project summaries.' })
  @ApiResponse({ status: HttpStatus.OK, type: ProjectDashboardResponseDto })
  @ApiParam({ name: 'organizationId', description: 'The unique organization identifier' })
  async getDashboard(@Param('organizationId') organizationId: string) {
    return this.service.getOrganizationDashboard(organizationId);
  }

  @Get(':id')
  @Permissions('project.read')
  @ApiOperation({ summary: 'Find project by ID', description: 'Retrieves a single project including members, files, and milestone timeline details.' })
  @ApiResponse({ status: HttpStatus.OK, type: ProjectResponseDto })
  async findOne(@Param('id') id: string) {
    return this.service.findProjectById(id);
  }

  @Patch(':id')
  @Permissions('project.update')
  @ApiOperation({ summary: 'Update project settings', description: 'Updates core properties like dates, budget, description, status, or name.' })
  @ApiResponse({ status: HttpStatus.OK, type: ProjectResponseDto })
  async update(@Param('id') id: string, @Body() updateDto: UpdateProjectDto, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.updateProject(id, updateDto, userId);
  }

  @Delete(':id')
  @Permissions('project.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete/archive project', description: 'Deactivates a project and flags its deletedAt timestamp.' })
  @ApiResponse({ status: HttpStatus.OK, type: ProjectResponseDto })
  async remove(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.softDeleteProject(id, userId);
  }

  @Post(':id/restore')
  @Permissions('project.delete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore archived project', description: 'Restores a previously soft-deleted project by resetting its deletedAt field.' })
  @ApiResponse({ status: HttpStatus.OK, type: ProjectResponseDto })
  async restore(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    return this.service.restoreProject(id, userId);
  }

  // ==========================================
  // PROJECT MEMBER ENDPOINTS
  // ==========================================

  @Post(':id/members')
  @Permissions('project.manage_members')
  @ApiOperation({ summary: 'Add member to project', description: 'Enrolls a user into the project team under a specific role.' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ProjectMemberResponseDto })
  async addMember(@Param('id') projectId: string, @Body() memberDto: AddProjectMemberDto, @Req() req: any) {
    const executorId = req.user?.id;
    return this.service.addProjectMember(projectId, memberDto, executorId);
  }

  @Patch(':id/members/:userId')
  @Permissions('project.manage_members')
  @ApiOperation({ summary: 'Update project member role', description: 'Modifies the clearance role of a member user inside the project.' })
  @ApiResponse({ status: HttpStatus.OK })
  async updateMember(
    @Param('id') projectId: string,
    @Param('userId') userId: string,
    @Body() memberDto: UpdateProjectMemberDto,
    @Req() req: any,
  ) {
    const executorId = req.user?.id;
    return this.service.updateProjectMember(projectId, userId, memberDto, executorId);
  }

  @Delete(':id/members/:userId')
  @Permissions('project.manage_members')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove member from project', description: 'Revokes a user’s association with this project.' })
  @ApiResponse({ status: HttpStatus.OK })
  async removeMember(@Param('id') projectId: string, @Param('userId') userId: string, @Req() req: any) {
    const executorId = req.user?.id;
    return this.service.removeProjectMember(projectId, userId, executorId);
  }

  // ==========================================
  // PROJECT FILE ENDPOINTS
  // ==========================================

  @Post(':id/files')
  @Permissions('project.manage_files')
  @ApiOperation({ summary: 'Upload file metadata to project', description: 'Registers a file URL, name, and size under the project.' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ProjectFileResponseDto })
  async addFile(@Param('id') projectId: string, @Body() fileDto: CreateProjectFileDto, @Req() req: any) {
    const uploadedById = req.user?.id;
    return this.service.addProjectFile(projectId, fileDto, uploadedById);
  }

  @Get(':id/files')
  @Permissions('project.read')
  @ApiOperation({ summary: 'List project files', description: 'Retrieves all document metadata uploaded for the project.' })
  @ApiResponse({ status: HttpStatus.OK, type: [ProjectFileResponseDto] })
  async getFiles(@Param('id') projectId: string) {
    return this.service.getProjectFiles(projectId);
  }

  @Delete('files/:fileId')
  @Permissions('project.manage_files')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete file metadata', description: 'Deletes file metadata from the project database.' })
  @ApiResponse({ status: HttpStatus.OK })
  async removeFile(@Param('fileId') fileId: string, @Req() req: any) {
    const executorId = req.user?.id;
    return this.service.deleteProjectFile(fileId, executorId);
  }

  // ==========================================
  // PROJECT TIMELINE (MILESTONE) ENDPOINTS
  // ==========================================

  @Post(':id/milestones')
  @Permissions('project.manage_milestones')
  @ApiOperation({ summary: 'Create timeline milestone', description: 'Adds a key milestone target on the project timeline.' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ProjectMilestoneResponseDto })
  async addMilestone(@Param('id') projectId: string, @Body() milestoneDto: CreateProjectMilestoneDto, @Req() req: any) {
    const executorId = req.user?.id;
    return this.service.addProjectMilestone(projectId, milestoneDto, executorId);
  }

  @Patch('milestones/:milestoneId')
  @Permissions('project.manage_milestones')
  @ApiOperation({ summary: 'Update timeline milestone details', description: 'Updates completion status, title, description, or due date.' })
  @ApiResponse({ status: HttpStatus.OK, type: ProjectMilestoneResponseDto })
  async updateMilestone(
    @Param('milestoneId') milestoneId: string,
    @Body() milestoneDto: UpdateProjectMilestoneDto,
    @Req() req: any,
  ) {
    const executorId = req.user?.id;
    return this.service.updateProjectMilestone(milestoneId, milestoneDto, executorId);
  }

  @Delete('milestones/:milestoneId')
  @Permissions('project.manage_milestones')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete project milestone', description: 'Removes a milestone from the project timeline.' })
  @ApiResponse({ status: HttpStatus.OK })
  async removeMilestone(@Param('milestoneId') milestoneId: string, @Req() req: any) {
    const executorId = req.user?.id;
    return this.service.deleteProjectMilestone(milestoneId, executorId);
  }

  // ==========================================
  // PROJECT ANALYTICS ENDPOINTS
  // ==========================================

  @Get(':id/analytics')
  @Permissions('project.analytics')
  @ApiOperation({ summary: 'Calculate project progress and analytics', description: 'Generates real-time completion rates, days remaining, milestones count, and health statuses.' })
  @ApiResponse({ status: HttpStatus.OK, type: ProjectAnalyticsResponseDto })
  async getAnalytics(@Param('id') projectId: string) {
    return this.service.getProjectAnalytics(projectId);
  }
}
