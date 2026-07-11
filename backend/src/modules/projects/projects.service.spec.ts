import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { ProjectsRepository } from './projects.repository';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ProjectsService Unit Tests', () => {
  let service: ProjectsService;
  let repo: ProjectsRepository;
  let prisma: PrismaService;
  let audit: AuditService;

  // Mock outputs
  const mockOrg = { id: 'org-id-123', name: 'BuildTrace Corp' };
  const mockUser = { id: 'user-id-123', email: 'test@buildtrace.in' };
  const mockProject = {
    id: 'proj-id-123',
    name: 'Bangalore Tech Park',
    description: 'Tech hub foundation',
    status: 'ACTIVE',
    startDate: new Date(),
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days in future
    budget: 500000.0,
    organizationId: 'org-id-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    members: [],
    files: [],
    milestones: [],
  };

  beforeEach(async () => {
    const mockProjectsRepository = {
      createProject: jest.fn().mockResolvedValue(mockProject),
      updateProject: jest.fn().mockResolvedValue({ ...mockProject, name: 'Updated Bangalore Tech Park' }),
      findProjectById: jest.fn().mockResolvedValue(mockProject),
      findProjectByNameAndOrg: jest.fn().mockResolvedValue(null),
      findAllProjects: jest.fn().mockResolvedValue({ items: [mockProject], totalItems: 1 }),
      softDeleteProject: jest.fn().mockResolvedValue({ ...mockProject, deletedAt: new Date() }),
      restoreProject: jest.fn().mockResolvedValue({ ...mockProject, deletedAt: null }),
      addProjectMember: jest.fn().mockResolvedValue({ projectId: 'proj-id-123', userId: 'user-id-123', role: 'MEMBER' }),
      getProjectMember: jest.fn().mockResolvedValue(null),
    };

    const mockAuditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const mockPrismaService = {
      organization: {
        findUnique: jest.fn().mockResolvedValue(mockOrg),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue(mockUser),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: ProjectsRepository, useValue: mockProjectsRepository },
        { provide: AuditService, useValue: mockAuditService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    repo = module.get<ProjectsRepository>(ProjectsRepository);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createProject', () => {
    const createDto = {
      name: 'Bangalore Tech Park',
      description: 'Tech hub foundation',
      organizationId: 'org-id-123',
    };

    it('should successfully create a project if organization exists and name is unique', async () => {
      const result = await service.createProject(createDto, 'executor-123');
      expect(prisma.organization.findUnique).toHaveBeenCalledWith({ where: { id: 'org-id-123' } });
      expect(repo.findProjectByNameAndOrg).toHaveBeenCalledWith('Bangalore Tech Park', 'org-id-123');
      expect(repo.createProject).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledWith(expect.objectContaining({ action: 'INSERT', tableName: 'Project' }));
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if organization does not exist', async () => {
      jest.spyOn(prisma.organization, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.createProject(createDto, 'executor-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if project name already exists in same organization', async () => {
      jest.spyOn(repo, 'findProjectByNameAndOrg').mockResolvedValueOnce(mockProject as any);
      await expect(service.createProject(createDto, 'executor-123')).rejects.toThrow(ConflictException);
    });
  });

  describe('findProjectById', () => {
    it('should return project details if project exists', async () => {
      const result = await service.findProjectById('proj-id-123');
      expect(repo.findProjectById).toHaveBeenCalledWith('proj-id-123');
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException if project does not exist', async () => {
      jest.spyOn(repo, 'findProjectById').mockResolvedValueOnce(null);
      await expect(service.findProjectById('non-existent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('analytics calculations', () => {
    it('should correctly calculate completion rate and days remaining', async () => {
      const complexProject = {
        ...mockProject,
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days remaining
        members: [{}, {}], // 2 members
        files: [{}, {}, {}], // 3 files
        milestones: [
          { id: '1', title: 'M1', status: 'COMPLETED' },
          { id: '2', title: 'M2', status: 'PENDING' },
          { id: '3', title: 'M3', status: 'OVERDUE' },
        ],
      };
      jest.spyOn(repo, 'findProjectById').mockResolvedValueOnce(complexProject as any);

      const result = await service.getProjectAnalytics('proj-id-123');

      expect(result.totalMembers).toBe(2);
      expect(result.totalFiles).toBe(3);
      expect(result.totalMilestones).toBe(3);
      expect(result.completionRate).toBe(33.3); // 1 completed out of 3
      expect(result.milestoneBreakdown.completed).toBe(1);
      expect(result.milestoneBreakdown.pending).toBe(1);
      expect(result.milestoneBreakdown.overdue).toBe(1);
      expect(result.daysRemaining).toBe(5);
      expect(result.healthStatus).toBe('At Risk'); // Overdue count > 0 causes At Risk health
    });
  });
});
