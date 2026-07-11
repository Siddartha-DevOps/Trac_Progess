import { Test, TestingModule } from '@nestjs/testing';
import { BimController } from './bim.controller';
import { BimService } from './bim.service';
import { CreateBimModelDto } from './dto/create-bim-model.dto';
import { UpdateBimModelDto } from './dto/update-bim-model.dto';
import { QueryBimModelDto } from './dto/query-bim-model.dto';
import { CompareBimModelsDto } from './dto/compare-bim-models.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { ExecutionContext } from '@nestjs/common';

describe('BimController Unit Tests', () => {
  let controller: BimController;
  let service: BimService;

  const mockModel = {
    id: 'model-111',
    name: 'Bangalore Tech Park Block A',
    description: 'Structural discipline model',
    fileUrl: 'https://storage.buildtrace.in/models/bld-111_struc_v1.ifc',
    fileType: 'IFC',
    version: 1,
    status: 'COMPLETED',
    coordinateSystem: { crs: 'EPSG:3857', origin: [0, 0, 0] },
    metadata: { extractedElementsCount: 3 },
    projectId: 'proj-111',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockBimService = {
      createModel: jest.fn().mockResolvedValue(mockModel),
      updateModel: jest.fn().mockResolvedValue({ ...mockModel, name: 'Bangalore Block A Revised' }),
      findModelById: jest.fn().mockResolvedValue(mockModel),
      findAllModels: jest.fn().mockResolvedValue({ items: [mockModel], totalItems: 1 }),
      softDeleteModel: jest.fn().mockResolvedValue({ ...mockModel, deletedAt: new Date() }),
      restoreModel: jest.fn().mockResolvedValue({ ...mockModel, deletedAt: null }),
      alignCoordinates: jest.fn().mockResolvedValue({
        ...mockModel,
        coordinateSystem: { crs: 'EPSG:3857', origin: [10, 20, 0] },
      }),
      compareModels: jest.fn().mockResolvedValue({
        comparisonSummary: { addedCount: 1, deletedCount: 0, modifiedCount: 1, unchangedCount: 5 },
        added: [],
        deleted: [],
        modified: [],
      }),
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
      controllers: [BimController],
      providers: [
        { provide: BimService, useValue: mockBimService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(PermissionsGuard)
      .useValue(mockPermissionsGuard)
      .compile();

    controller = module.get<BimController>(BimController);
    service = module.get<BimService>(BimService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call bimService.createModel with dto and request user id', async () => {
      const dto: CreateBimModelDto = {
        name: 'Bangalore Tech Park Block A',
        fileUrl: 'https://storage.buildtrace.in/models/bld-111_struc_v1.ifc',
        fileType: 'IFC',
        projectId: 'proj-111',
      };
      const req = { user: { id: 'user-id-123' } };

      const result = await controller.create(dto, req);
      expect(service.createModel).toHaveBeenCalledWith(dto, 'user-id-123');
      expect(result).toEqual(mockModel);
    });
  });

  describe('findAll', () => {
    it('should retrieve a list of bim models based on query', async () => {
      const query: QueryBimModelDto = { projectId: 'proj-111', page: 1, limit: 10 };
      const result = await controller.findAll(query);
      expect(service.findAllModels).toHaveBeenCalledWith(query);
      expect(result.items).toContainEqual(mockModel);
    });
  });

  describe('compare', () => {
    it('should invoke comparison logic on service layer', async () => {
      const dto: CompareBimModelsDto = { sourceModelId: 'model-111', targetModelId: 'model-222' };
      const result = await controller.compare(dto);
      expect(service.compareModels).toHaveBeenCalledWith(dto);
      expect(result.comparisonSummary.addedCount).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should fetch details of specified model ID', async () => {
      const result = await controller.findOne('model-111');
      expect(service.findModelById).toHaveBeenCalledWith('model-111');
      expect(result).toEqual(mockModel);
    });
  });

  describe('update', () => {
    it('should submit changes to the service layer', async () => {
      const dto: UpdateBimModelDto = { name: 'Bangalore Block A Revised' };
      const req = { user: { id: 'user-id-123' } };

      const result = await controller.update('model-111', dto, req);
      expect(service.updateModel).toHaveBeenCalledWith('model-111', dto, 'user-id-123');
      expect(result.name).toBe('Bangalore Block A Revised');
    });
  });

  describe('remove', () => {
    it('should flag the model as soft-deleted', async () => {
      const req = { user: { id: 'user-id-123' } };
      const result = await controller.remove('model-111', req);
      expect(service.softDeleteModel).toHaveBeenCalledWith('model-111', 'user-id-123');
      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('restore', () => {
    it('should clear the deletedAt flag', async () => {
      const req = { user: { id: 'user-id-123' } };
      const result = await controller.restore('model-111', req);
      expect(service.restoreModel).toHaveBeenCalledWith('model-111', 'user-id-123');
      expect(result.deletedAt).toBeNull();
    });
  });

  describe('alignCoordinates', () => {
    it('should update coordinate parameters on the model', async () => {
      const body = { coordinateSystem: { crs: 'EPSG:3857', origin: [10, 20, 0] } };
      const req = { user: { id: 'user-id-123' } };

      const result = await controller.alignCoordinates('model-111', body, req);
      expect(service.alignCoordinates).toHaveBeenCalledWith('model-111', body.coordinateSystem, 'user-id-123');
      expect(result.coordinateSystem.origin).toEqual([10, 20, 0]);
    });
  });
});
