import { Injectable, NotFoundException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { ProjectsRepository } from './projects.repository';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { AddProjectMemberDto, UpdateProjectMemberDto } from './dto/project-member.dto';
import { CreateProjectFileDto } from './dto/project-file.dto';
import { CreateProjectMilestoneDto, UpdateProjectMilestoneDto } from './dto/project-milestone.dto';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly repo: ProjectsRepository,
    private readonly audit: AuditService,
    private readonly prisma: PrismaService, // injected for cross-module existence checks
  ) {}

  // ==========================================
  // PROJECT SERVICE OPERATIONS
  // ==========================================

  async createProject(createDto: CreateProjectDto, userId?: string) {
    this.logger.log(`Validating and creating project: ${createDto.name}`);

    // Check organization existence
    const organization = await this.prisma.organization.findUnique({
      where: { id: createDto.organizationId },
    });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${createDto.organizationId} does not exist.`);
    }

    // Check duplicate project name within same organization
    const existing = await this.repo.findProjectByNameAndOrg(createDto.name, createDto.organizationId);
    if (existing) {
      throw new ConflictException(`Project with name '${createDto.name}' already exists in this organization.`);
    }

    const project = await this.repo.createProject(createDto);

    // Write audit log
    await this.audit.log({
      action: 'INSERT',
      tableName: 'Project',
      recordId: project.id,
      newValues: project,
      userId,
      organizationId: project.organizationId,
    });

    return project;
  }

  async updateProject(id: string, updateDto: UpdateProjectDto, userId?: string) {
    this.logger.log(`Updating project: ${id}`);
    
    const project = await this.repo.findProjectById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }

    if (updateDto.name && updateDto.name.trim().toLowerCase() !== project.name.toLowerCase()) {
      const existing = await this.repo.findProjectByNameAndOrg(updateDto.name, project.organizationId);
      if (existing && existing.id !== id) {
        throw new ConflictException(`Project with name '${updateDto.name}' already exists in this organization.`);
      }
    }

    const updated = await this.repo.updateProject(id, updateDto);

    // Write audit log
    await this.audit.log({
      action: 'UPDATE',
      tableName: 'Project',
      recordId: id,
      oldValues: project,
      newValues: updated,
      userId,
      organizationId: project.organizationId,
    });

    return updated;
  }

  async findProjectById(id: string) {
    const project = await this.repo.findProjectById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }
    return project;
  }

  async findAllProjects(queryDto: QueryProjectDto) {
    return this.repo.findAllProjects(queryDto);
  }

  async softDeleteProject(id: string, userId?: string) {
    this.logger.log(`Archiving/soft-deleting project: ${id}`);
    const project = await this.repo.findProjectById(id);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }

    const deleted = await this.repo.softDeleteProject(id);

    await this.audit.log({
      action: 'DELETE',
      tableName: 'Project',
      recordId: id,
      oldValues: project,
      newValues: deleted,
      userId,
      organizationId: project.organizationId,
    });

    return deleted;
  }

  async restoreProject(id: string, userId?: string) {
    this.logger.log(`Restoring project: ${id}`);
    const project = await this.repo.findProjectById(id, true);
    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found.`);
    }

    const restored = await this.repo.restoreProject(id);

    await this.audit.log({
      action: 'RESTORE',
      tableName: 'Project',
      recordId: id,
      oldValues: project,
      newValues: restored,
      userId,
      organizationId: project.organizationId,
    });

    return restored;
  }

  // ==========================================
  // PROJECT MEMBERS BUSINESS LOGIC
  // ==========================================

  async addProjectMember(projectId: string, memberDto: AddProjectMemberDto, executorId?: string) {
    const project = await this.repo.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    // Validate user exists
    const user = await this.prisma.user.findUnique({
      where: { id: memberDto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${memberDto.userId} does not exist.`);
    }

    // Check if already a member
    const existing = await this.repo.getProjectMember(projectId, memberDto.userId);
    if (existing) {
      throw new ConflictException(`User is already a member of this project.`);
    }

    const member = await this.repo.addProjectMember(projectId, memberDto.userId, memberDto.role);

    await this.audit.log({
      action: 'INSERT',
      tableName: 'ProjectMember',
      recordId: `${projectId}_${memberDto.userId}`,
      newValues: member,
      userId: executorId,
      organizationId: project.organizationId,
    });

    return member;
  }

  async updateProjectMember(projectId: string, userId: string, memberDto: UpdateProjectMemberDto, executorId?: string) {
    const project = await this.repo.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    const member = await this.repo.getProjectMember(projectId, userId);
    if (!member) {
      throw new NotFoundException(`User with ID ${userId} is not a member of this project.`);
    }

    const updated = await this.repo.updateProjectMember(projectId, userId, memberDto.role);

    await this.audit.log({
      action: 'UPDATE',
      tableName: 'ProjectMember',
      recordId: `${projectId}_${userId}`,
      oldValues: member,
      newValues: updated,
      userId: executorId,
      organizationId: project.organizationId,
    });

    return updated;
  }

  async removeProjectMember(projectId: string, userId: string, executorId?: string) {
    const project = await this.repo.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    const member = await this.repo.getProjectMember(projectId, userId);
    if (!member) {
      throw new NotFoundException(`User with ID ${userId} is not a member of this project.`);
    }

    await this.repo.removeProjectMember(projectId, userId);

    await this.audit.log({
      action: 'DELETE',
      tableName: 'ProjectMember',
      recordId: `${projectId}_${userId}`,
      oldValues: member,
      userId: executorId,
      organizationId: project.organizationId,
    });

    return { success: true, message: 'Member successfully removed.' };
  }

  // ==========================================
  // PROJECT FILES BUSINESS LOGIC
  // ==========================================

  async addProjectFile(projectId: string, fileDto: CreateProjectFileDto, uploadedById?: string) {
    const project = await this.repo.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    if (uploadedById) {
      const user = await this.prisma.user.findUnique({ where: { id: uploadedById } });
      if (!user) {
        throw new NotFoundException(`Uploader User with ID ${uploadedById} does not exist.`);
      }
    }

    const file = await this.repo.addProjectFile(projectId, fileDto, uploadedById);

    await this.audit.log({
      action: 'INSERT',
      tableName: 'ProjectFile',
      recordId: file.id,
      newValues: file,
      userId: uploadedById,
      organizationId: project.organizationId,
    });

    return file;
  }

  async getProjectFiles(projectId: string) {
    const project = await this.repo.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }
    return this.repo.getProjectFiles(projectId);
  }

  async deleteProjectFile(fileId: string, executorId?: string) {
    const file = await this.repo.getProjectFile(fileId);
    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found.`);
    }

    const project = await this.repo.findProjectById(file.projectId);
    const orgId = project?.organizationId;

    await this.repo.deleteProjectFile(fileId);

    await this.audit.log({
      action: 'DELETE',
      tableName: 'ProjectFile',
      recordId: fileId,
      oldValues: file,
      userId: executorId,
      organizationId: orgId,
    });

    return { success: true, message: 'File deleted.' };
  }

  // ==========================================
  // PROJECT TIMELINE / MILESTONES BUSINESS LOGIC
  // ==========================================

  async addProjectMilestone(projectId: string, milestoneDto: CreateProjectMilestoneDto, executorId?: string) {
    const project = await this.repo.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    const milestone = await this.repo.addProjectMilestone(projectId, milestoneDto);

    await this.audit.log({
      action: 'INSERT',
      tableName: 'ProjectMilestone',
      recordId: milestone.id,
      newValues: milestone,
      userId: executorId,
      organizationId: project.organizationId,
    });

    return milestone;
  }

  async updateProjectMilestone(milestoneId: string, milestoneDto: UpdateProjectMilestoneDto, executorId?: string) {
    const milestone = await this.repo.getProjectMilestone(milestoneId);
    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${milestoneId} not found.`);
    }

    const project = await this.repo.findProjectById(milestone.projectId);
    const updated = await this.repo.updateProjectMilestone(milestoneId, milestoneDto);

    await this.audit.log({
      action: 'UPDATE',
      tableName: 'ProjectMilestone',
      recordId: milestoneId,
      oldValues: milestone,
      newValues: updated,
      userId: executorId,
      organizationId: project?.organizationId,
    });

    return updated;
  }

  async deleteProjectMilestone(milestoneId: string, executorId?: string) {
    const milestone = await this.repo.getProjectMilestone(milestoneId);
    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${milestoneId} not found.`);
    }

    const project = await this.repo.findProjectById(milestone.projectId);

    await this.repo.deleteProjectMilestone(milestoneId);

    await this.audit.log({
      action: 'DELETE',
      tableName: 'ProjectMilestone',
      recordId: milestoneId,
      oldValues: milestone,
      userId: executorId,
      organizationId: project?.organizationId,
    });

    return { success: true, message: 'Milestone deleted.' };
  }

  // ==========================================
  // METRICS & ANALYTICS CALCULATION
  // ==========================================

  async getProjectAnalytics(projectId: string) {
    const project = await this.repo.findProjectById(projectId);
    if (!project) {
      throw new NotFoundException(`Project with ID ${projectId} not found.`);
    }

    const totalMembers = project.members.length;
    const totalFiles = project.files.length;
    const totalMilestones = project.milestones.length;

    const pending = project.milestones.filter(m => m.status === 'PENDING').length;
    const completed = project.milestones.filter(m => m.status === 'COMPLETED').length;
    const overdue = project.milestones.filter(m => m.status === 'OVERDUE').length;
    const onHold = project.milestones.filter(m => m.status === 'ON_HOLD').length;

    const completionRate = totalMilestones > 0
      ? parseFloat(((completed / totalMilestones) * 100).toFixed(1))
      : 0.0;

    // Days remaining calculation
    let daysRemaining = 0;
    if (project.endDate) {
      const end = new Date(project.endDate).getTime();
      const now = Date.now();
      const diffTime = end - now;
      daysRemaining = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
    }

    // Health calculation
    let healthStatus = 'On Track';
    if (overdue > 0) {
      healthStatus = 'At Risk';
    } else if (onHold > 2) {
      healthStatus = 'Needs Attention';
    } else if (totalMilestones === 0) {
      healthStatus = 'Unscheduled';
    }

    return {
      projectId: project.id,
      projectName: project.name,
      status: project.status,
      totalMembers,
      totalFiles,
      totalMilestones,
      completionRate,
      budget: project.budget,
      milestoneBreakdown: {
        pending,
        completed,
        overdue,
        onHold,
      },
      daysRemaining,
      healthStatus,
    };
  }

  async getOrganizationDashboard(organizationId: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!organization) {
      throw new NotFoundException(`Organization with ID ${organizationId} does not exist.`);
    }

    return this.repo.getOrganizationDashboard(organizationId);
  }
}
