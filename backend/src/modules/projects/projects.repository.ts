import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { CreateProjectFileDto } from './dto/project-file.dto';
import { CreateProjectMilestoneDto, UpdateProjectMilestoneDto } from './dto/project-milestone.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProjectsRepository {
  private readonly logger = new Logger(ProjectsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // PROJECT CRUD OPERATIONS
  // ==========================================

  async createProject(createDto: CreateProjectDto) {
    this.logger.log(`Inserting new Project into database: ${createDto.name}`);
    return this.prisma.project.create({
      data: {
        name: createDto.name.trim(),
        description: createDto.description || null,
        status: createDto.status || 'PLANNING',
        startDate: createDto.startDate ? new Date(createDto.startDate) : null,
        endDate: createDto.endDate ? new Date(createDto.endDate) : null,
        budget: createDto.budget ?? 0.0,
        organizationId: createDto.organizationId,
      },
    });
  }

  async updateProject(id: string, updateDto: UpdateProjectDto) {
    this.logger.log(`Updating Project record with ID: ${id}`);
    return this.prisma.project.update({
      where: { id },
      data: {
        name: updateDto.name !== undefined ? updateDto.name.trim() : undefined,
        description: updateDto.description !== undefined ? updateDto.description : undefined,
        status: updateDto.status !== undefined ? updateDto.status : undefined,
        startDate: updateDto.startDate !== undefined ? (updateDto.startDate ? new Date(updateDto.startDate) : null) : undefined,
        endDate: updateDto.endDate !== undefined ? (updateDto.endDate ? new Date(updateDto.endDate) : null) : undefined,
        budget: updateDto.budget !== undefined ? updateDto.budget : undefined,
      },
    });
  }

  async findProjectById(id: string, includeDeleted = false) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        files: true,
        milestones: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    if (project && project.deletedAt && !includeDeleted) {
      return null;
    }

    return project;
  }

  async findProjectByNameAndOrg(name: string, organizationId: string, includeDeleted = false) {
    const project = await this.prisma.project.findFirst({
      where: {
        name: { equals: name.trim(), mode: 'insensitive' },
        organizationId,
      },
    });

    if (project && project.deletedAt && !includeDeleted) {
      return null;
    }

    return project;
  }

  async findAllProjects(queryDto: QueryProjectDto) {
    const { organizationId, status, search, page = 1, limit = 10, includeDeleted = false } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    this.logger.log(`Executing projects query with filters: ${JSON.stringify(where)}`);

    const [items, totalItems] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          files: true,
          milestones: true,
        },
      }),
      this.prisma.project.count({ where }),
    ]);

    return { items, totalItems };
  }

  async softDeleteProject(id: string) {
    this.logger.log(`Setting soft-delete timestamp for Project ID: ${id}`);
    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restoreProject(id: string) {
    this.logger.log(`Restoring soft-deleted Project ID: ${id}`);
    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  // ==========================================
  // PROJECT MEMBERS OPERATIONS
  // ==========================================

  async addProjectMember(projectId: string, userId: string, role: string) {
    this.logger.log(`Adding member User: ${userId} to Project: ${projectId} as role: ${role}`);
    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async updateProjectMember(projectId: string, userId: string, role: string) {
    this.logger.log(`Updating member role User: ${userId} in Project: ${projectId} to: ${role}`);
    return this.prisma.projectMember.update({
      where: {
        projectId_userId: { projectId, userId },
      },
      data: { role },
    });
  }

  async removeProjectMember(projectId: string, userId: string) {
    this.logger.log(`Removing member User: ${userId} from Project: ${projectId}`);
    return this.prisma.projectMember.delete({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
  }

  async getProjectMember(projectId: string, userId: string) {
    return this.prisma.projectMember.findUnique({
      where: {
        projectId_userId: { projectId, userId },
      },
    });
  }

  // ==========================================
  // PROJECT FILES OPERATIONS
  // ==========================================

  async addProjectFile(projectId: string, fileData: CreateProjectFileDto, uploadedById?: string) {
    this.logger.log(`Adding file ${fileData.name} to Project: ${projectId}`);
    return this.prisma.projectFile.create({
      data: {
        name: fileData.name,
        url: fileData.url,
        size: fileData.size,
        mimeType: fileData.mimeType || null,
        projectId,
        uploadedById: uploadedById || null,
      },
    });
  }

  async getProjectFiles(projectId: string) {
    return this.prisma.projectFile.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getProjectFile(id: string) {
    return this.prisma.projectFile.findUnique({
      where: { id },
    });
  }

  async deleteProjectFile(id: string) {
    this.logger.log(`Deleting ProjectFile record with ID: ${id}`);
    return this.prisma.projectFile.delete({
      where: { id },
    });
  }

  // ==========================================
  // PROJECT TIMELINE / MILESTONES OPERATIONS
  // ==========================================

  async addProjectMilestone(projectId: string, milestoneData: CreateProjectMilestoneDto) {
    this.logger.log(`Adding timeline milestone ${milestoneData.title} to Project: ${projectId}`);
    return this.prisma.projectMilestone.create({
      data: {
        title: milestoneData.title.trim(),
        description: milestoneData.description || null,
        dueDate: new Date(milestoneData.dueDate),
        status: milestoneData.status || 'PENDING',
        projectId,
      },
    });
  }

  async updateProjectMilestone(id: string, milestoneData: UpdateProjectMilestoneDto) {
    this.logger.log(`Updating milestone ID: ${id}`);
    return this.prisma.projectMilestone.update({
      where: { id },
      data: {
        title: milestoneData.title !== undefined ? milestoneData.title.trim() : undefined,
        description: milestoneData.description !== undefined ? milestoneData.description : undefined,
        dueDate: milestoneData.dueDate !== undefined ? new Date(milestoneData.dueDate) : undefined,
        status: milestoneData.status !== undefined ? milestoneData.status : undefined,
      },
    });
  }

  async getProjectMilestone(id: string) {
    return this.prisma.projectMilestone.findUnique({
      where: { id },
    });
  }

  async deleteProjectMilestone(id: string) {
    this.logger.log(`Deleting milestone ID: ${id}`);
    return this.prisma.projectMilestone.delete({
      where: { id },
    });
  }

  // ==========================================
  // DASHBOARD & ANALYTICS AGGREGATIONS
  // ==========================================

  async getOrganizationDashboard(organizationId: string) {
    const projects = await this.prisma.project.findMany({
      where: { organizationId, deletedAt: null },
      include: {
        members: true,
        milestones: true,
      },
    });

    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
    const planningProjects = projects.filter(p => p.status === 'PLANNING').length;
    const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
    const cumulativeBudget = projects.reduce((acc, curr) => acc + curr.budget, 0);

    const projectSummaries = projects.map(p => {
      const milestones = p.milestones;
      const completedMilestonesCount = milestones.filter(m => m.status === 'COMPLETED').length;
      const completionRate = milestones.length > 0
        ? parseFloat(((completedMilestonesCount / milestones.length) * 100).toFixed(1))
        : 0.0;

      return {
        id: p.id,
        name: p.name,
        status: p.status,
        completionRate,
        milestoneCount: milestones.length,
        memberCount: p.members.length,
      };
    });

    return {
      activeProjects,
      planningProjects,
      completedProjects,
      totalProjects,
      cumulativeBudget,
      projectSummaries,
    };
  }
}
