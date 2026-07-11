import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AddProjectMemberDto } from './dto/project-member.dto';
import { CreateProjectFileDto } from './dto/project-file.dto';
import { CreateProjectMilestoneDto } from './dto/project-milestone.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { PrismaService } from '../../common/prisma/prisma.service';

describe('ProjectsController Unit Tests', () => {
  let controller: ProjectsController;
  let service: ProjectsService;

  const mockProject = {
    id: 'proj-id-123',
    name: 'Bangalore Tech Park',
    status: 'PLANNING',
    organizationId: 'org-id-123',
  };

  beforeEach(async () => {
    const mockProjectsService = {
      createProject: jest.fn().mockResolvedValue(mockProject),
      updateProject: jest.fn().mockResolvedValue({ ...mockProject, name: 'Updated name' }),
      findProjectById: jest.fn().mockResolvedValue(mockProject),
      findAllProjects: jest.fn().mockResolvedValue({ items: [mockProject], totalItems: 1 }),
      softDeleteProject: jest.fn().mockResolvedValue({ ...mockProject, deletedAt: new Date() }),
      restoreProject: jest.fn().mockResolvedValue(mockProject),
      addProjectMember: jest.fn().mockResolvedValue({ projectId: 'proj-id-123', userId: 'user-1', role: 'MANAGER' }),
      updateProjectMember: jest.fn().mockResolvedValue({ projectId: 'proj-id-123', userId: 'user-1', role: 'VIEWER' }),
      removeProjectMember: jest.fn().mockResolvedValue({ success: true }),
      addProjectFile: jest.fn().mockResolvedValue({ id: 'file-123', name: 'model.rvt', url: 'http://loc/1.rvt', size: 100 }),
      getProjectFiles: jest.fn().mockResolvedValue([{ id: 'file-123', name: 'model.rvt' }]),
      deleteProjectFile: jest.fn().mockResolvedValue({ success: true }),
      addProjectMilestone: jest.fn().mockResolvedValue({ id: 'milestone-123', title: 'Phase 1' }),
      updateProjectMilestone: jest.fn().mockResolvedValue({ id: 'milestone-123', title: 'Phase 1 - Updated' }),
      deleteProjectMilestone: jest.fn().mockResolvedValue({ success: true }),
      getProjectAnalytics: jest.fn().mockResolvedValue({ projectId: 'proj-id-123', completionRate: 75 }),
      getOrganizationDashboard: jest.fn().mockResolvedValue({ totalProjects: 5 }),
    };

    const mockPrismaService = {}; // Empty since we override guards which use it

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectsController],
      providers: [
        { provide: ProjectsService, useValue: mockProjectsService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ProjectsController>(ProjectsController);
    service = module.get<ProjectsService>(ProjectsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create project', () => {
    it('should call ProjectsService.createProject with dto and executor', async () => {
      const dto: CreateProjectDto = {
        name: 'Bangalore Tech Park',
        organizationId: 'org-id-123',
        budget: 100000,
      };
      const req = { user: { id: 'admin-1' } };

      const result = await controller.create(dto, req);
      expect(service.createProject).toHaveBeenCalledWith(dto, 'admin-1');
      expect(result).toEqual(mockProject);
    });
  });

  describe('update project', () => {
    it('should call ProjectsService.updateProject with id, dto and executor', async () => {
      const dto: UpdateProjectDto = { name: 'Updated name' };
      const req = { user: { id: 'admin-1' } };

      const result = await controller.update('proj-id-123', dto, req);
      expect(service.updateProject).toHaveBeenCalledWith('proj-id-123', dto, 'admin-1');
      expect(result.name).toBe('Updated name');
    });
  });

  describe('delete/archive project', () => {
    it('should call softDeleteProject', async () => {
      const req = { user: { id: 'admin-1' } };
      await controller.remove('proj-id-123', req);
      expect(service.softDeleteProject).toHaveBeenCalledWith('proj-id-123', 'admin-1');
    });
  });

  describe('members management', () => {
    it('should successfully add a member', async () => {
      const dto: AddProjectMemberDto = { userId: 'user-1', role: 'MANAGER' };
      const req = { user: { id: 'admin-1' } };

      const result = await controller.addMember('proj-id-123', dto, req);
      expect(service.addProjectMember).toHaveBeenCalledWith('proj-id-123', dto, 'admin-1');
      expect(result.role).toBe('MANAGER');
    });
  });

  describe('files management', () => {
    it('should successfully upload metadata', async () => {
      const dto: CreateProjectFileDto = { name: 'model.rvt', url: 'http://loc/1.rvt', size: 100 };
      const req = { user: { id: 'admin-1' } };

      const result = await controller.addFile('proj-id-123', dto, req);
      expect(service.addProjectFile).toHaveBeenCalledWith('proj-id-123', dto, 'admin-1');
      expect(result.name).toBe('model.rvt');
    });
  });

  describe('milestones/timeline management', () => {
    it('should successfully add a milestone', async () => {
      const dto: CreateProjectMilestoneDto = { title: 'Phase 1', dueDate: '2026-12-31' };
      const req = { user: { id: 'admin-1' } };

      const result = await controller.addMilestone('proj-id-123', dto, req);
      expect(service.addProjectMilestone).toHaveBeenCalledWith('proj-id-123', dto, 'admin-1');
      expect(result.title).toBe('Phase 1');
    });
  });

  describe('analytics & dashboard', () => {
    it('should retrieve project analytics', async () => {
      const result = await controller.getAnalytics('proj-id-123');
      expect(service.getProjectAnalytics).toHaveBeenCalledWith('proj-id-123');
      expect(result.completionRate).toBe(75);
    });

    it('should retrieve organization dashboard', async () => {
      const result = await controller.getDashboard('org-id-123');
      expect(service.getOrganizationDashboard).toHaveBeenCalledWith('org-id-123');
      expect(result.totalProjects).toBe(5);
    });
  });
});
