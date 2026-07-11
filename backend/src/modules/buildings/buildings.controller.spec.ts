import { Test, TestingModule } from '@nestjs/testing';
import { BuildingsController } from './buildings.controller';
import { BuildingsService } from './buildings.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UpdateBuildingDto } from './dto/update-building.dto';
import { QueryBuildingDto } from './dto/query-building.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { ExecutionContext, HttpStatus } from '@nestjs/common';

describe('BuildingsController Unit Tests', () => {
  let controller: BuildingsController;
  let service: BuildingsService;

  const mockBuilding = {
    id: 'bld-abc',
    name: 'Tower A',
    projectId: 'project-123',
    status: 'PLANNING',
    floors: 14,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockBuildingsService = {
      createBuilding: jest.fn().mockResolvedValue(mockBuilding),
      updateBuilding: jest.fn().mockResolvedValue({ ...mockBuilding, name: 'Tower A - Main' }),
      findBuildingById: jest.fn().mockResolvedValue(mockBuilding),
      findAllBuildings: jest.fn().mockResolvedValue({ items: [mockBuilding], totalItems: 1 }),
      softDeleteBuilding: jest.fn().mockResolvedValue({ ...mockBuilding, deletedAt: new Date() }),
      restoreBuilding: jest.fn().mockResolvedValue({ ...mockBuilding, deletedAt: null }),
      getProjectBuildingsAnalytics: jest.fn().mockResolvedValue({ projectId: 'project-123', totalBuildings: 1 }),
    };

    const mockAuthGuard = {
      canActivate: (context: ExecutionContext) => {
        const req = context.switchToHttp().getRequest();
        req.user = { id: 'user-id-123', email: 'test@buildtrace.in', role: 'admin' };
        return true;
      },
    };

    const mockPermissionsGuard = {
      canActivate: () => true,
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [BuildingsController],
      providers: [
        { provide: BuildingsService, useValue: mockBuildingsService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(PermissionsGuard)
      .useValue(mockPermissionsGuard)
      .compile();

    controller = module.get<BuildingsController>(BuildingsController);
    service = module.get<BuildingsService>(BuildingsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should invoke buildingsService.createBuilding with body payload and request user', async () => {
      const dto: CreateBuildingDto = {
        name: 'Tower A',
        projectId: 'project-123',
      };
      const req = { user: { id: 'user-id-123' } };

      const result = await controller.create(dto, req);
      expect(service.createBuilding).toHaveBeenCalledWith(dto, 'user-id-123');
      expect(result).toEqual(mockBuilding);
    });
  });

  describe('findAll', () => {
    it('should fetch buildings matched to provided query params', async () => {
      const query: QueryBuildingDto = { projectId: 'project-123', page: 1, limit: 10 };
      const result = await controller.findAll(query);
      expect(service.findAllBuildings).toHaveBeenCalledWith(query);
      expect(result.items).toContainEqual(mockBuilding);
    });
  });

  describe('findOne', () => {
    it('should retrieve a single building matching param id', async () => {
      const result = await controller.findOne('bld-abc');
      expect(service.findBuildingById).toHaveBeenCalledWith('bld-abc');
      expect(result).toEqual(mockBuilding);
    });
  });

  describe('update', () => {
    it('should pass param id, update payload, and current user to update service', async () => {
      const dto: UpdateBuildingDto = { name: 'Tower A - Main' };
      const req = { user: { id: 'user-id-123' } };

      const result = await controller.update('bld-abc', dto, req);
      expect(service.updateBuilding).toHaveBeenCalledWith('bld-abc', dto, 'user-id-123');
      expect(result.name).toBe('Tower A - Main');
    });
  });

  describe('remove', () => {
    it('should issue soft deletion order via the service layer', async () => {
      const req = { user: { id: 'user-id-123' } };
      const result = await controller.remove('bld-abc', req);
      expect(service.softDeleteBuilding).toHaveBeenCalledWith('bld-abc', 'user-id-123');
      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('restore', () => {
    it('should issue restore instruction to service', async () => {
      const req = { user: { id: 'user-id-123' } };
      const result = await controller.restore('bld-abc', req);
      expect(service.restoreBuilding).toHaveBeenCalledWith('bld-abc', 'user-id-123');
      expect(result.deletedAt).toBeNull();
    });
  });

  describe('getAnalytics', () => {
    it('should aggregate metrics for designated project id', async () => {
      const result = await controller.getAnalytics('project-123');
      expect(service.getProjectBuildingsAnalytics).toHaveBeenCalledWith('project-123');
      expect(result.totalBuildings).toBe(1);
    });
  });
});
