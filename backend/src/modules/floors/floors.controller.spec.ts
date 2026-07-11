import { Test, TestingModule } from '@nestjs/testing';
import { FloorsController } from './floors.controller';
import { FloorsService } from './floors.service';
import { CreateFloorDto } from './dto/create-floor.dto';
import { UpdateFloorDto } from './dto/update-floor.dto';
import { QueryFloorDto } from './dto/query-floor.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { ExecutionContext } from '@nestjs/common';

describe('FloorsController Unit Tests', () => {
  let controller: FloorsController;
  let service: FloorsService;

  const mockFloor = {
    id: 'floor-abc',
    name: 'Ground Floor',
    number: 0,
    order: 0,
    buildingId: 'bld-123',
    status: 'PLANNING',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockFloorsService = {
      createFloor: jest.fn().mockResolvedValue(mockFloor),
      updateFloor: jest.fn().mockResolvedValue({ ...mockFloor, name: 'Ground Floor Lobby' }),
      findFloorById: jest.fn().mockResolvedValue(mockFloor),
      findAllFloors: jest.fn().mockResolvedValue({ items: [mockFloor], totalItems: 1 }),
      softDeleteFloor: jest.fn().mockResolvedValue({ ...mockFloor, deletedAt: new Date() }),
      restoreFloor: jest.fn().mockResolvedValue({ ...mockFloor, deletedAt: null }),
      reorderFloors: jest.fn().mockResolvedValue([mockFloor]),
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
      controllers: [FloorsController],
      providers: [
        { provide: FloorsService, useValue: mockFloorsService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(PermissionsGuard)
      .useValue(mockPermissionsGuard)
      .compile();

    controller = module.get<FloorsController>(FloorsController);
    service = module.get<FloorsService>(FloorsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should invoke floorsService.createFloor with body payload and request user', async () => {
      const dto: CreateFloorDto = {
        name: 'Ground Floor',
        number: 0,
        order: 0,
        buildingId: 'bld-123',
      };
      const req = { user: { id: 'user-id-123' } };

      const result = await controller.create(dto, req);
      expect(service.createFloor).toHaveBeenCalledWith(dto, 'user-id-123');
      expect(result).toEqual(mockFloor);
    });
  });

  describe('findAll', () => {
    it('should fetch floors matched to provided query params', async () => {
      const query: QueryFloorDto = { buildingId: 'bld-123', page: 1, limit: 10 };
      const result = await controller.findAll(query);
      expect(service.findAllFloors).toHaveBeenCalledWith(query);
      expect(result.items).toContainEqual(mockFloor);
    });
  });

  describe('findOne', () => {
    it('should retrieve a single floor matching param id', async () => {
      const result = await controller.findOne('floor-abc');
      expect(service.findFloorById).toHaveBeenCalledWith('floor-abc');
      expect(result).toEqual(mockFloor);
    });
  });

  describe('update', () => {
    it('should pass param id, update payload, and current user to update service', async () => {
      const dto: UpdateFloorDto = { name: 'Ground Floor Lobby' };
      const req = { user: { id: 'user-id-123' } };

      const result = await controller.update('floor-abc', dto, req);
      expect(service.updateFloor).toHaveBeenCalledWith('floor-abc', dto, 'user-id-123');
      expect(result.name).toBe('Ground Floor Lobby');
    });
  });

  describe('remove', () => {
    it('should issue soft deletion order via the service layer', async () => {
      const req = { user: { id: 'user-id-123' } };
      const result = await controller.remove('floor-abc', req);
      expect(service.softDeleteFloor).toHaveBeenCalledWith('floor-abc', 'user-id-123');
      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('restore', () => {
    it('should issue restore instruction to service', async () => {
      const req = { user: { id: 'user-id-123' } };
      const result = await controller.restore('floor-abc', req);
      expect(service.restoreFloor).toHaveBeenCalledWith('floor-abc', 'user-id-123');
      expect(result.deletedAt).toBeNull();
    });
  });

  describe('reorder', () => {
    it('should delegate ordering to reorderFloors service method', async () => {
      const req = { user: { id: 'user-id-123' } };
      const result = await controller.reorder(['floor-abc'], req);
      expect(service.reorderFloors).toHaveBeenCalledWith(['floor-abc'], 'user-id-123');
      expect(result).toBeDefined();
    });
  });
});
