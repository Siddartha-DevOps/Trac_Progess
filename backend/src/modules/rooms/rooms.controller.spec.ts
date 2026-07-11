import { Test, TestingModule } from '@nestjs/testing';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { AuthGuard } from '../../common/auth/auth.guard';
import { PermissionsGuard } from '../../common/auth/permissions.guard';
import { ExecutionContext } from '@nestjs/common';

describe('RoomsController Unit Tests', () => {
  let controller: RoomsController;
  let service: RoomsService;

  const mockRoom = {
    id: 'room-abc',
    name: 'Office 101',
    category: 'OFFICE',
    status: 'PLANNING',
    floorId: 'flr-123',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRoomsService = {
      createRoom: jest.fn().mockResolvedValue(mockRoom),
      updateRoom: jest.fn().mockResolvedValue({ ...mockRoom, name: 'Office 101 Suite' }),
      findRoomById: jest.fn().mockResolvedValue(mockRoom),
      findAllRooms: jest.fn().mockResolvedValue({ items: [mockRoom], totalItems: 1 }),
      softDeleteRoom: jest.fn().mockResolvedValue({ ...mockRoom, deletedAt: new Date() }),
      restoreRoom: jest.fn().mockResolvedValue({ ...mockRoom, deletedAt: null }),
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
      controllers: [RoomsController],
      providers: [
        { provide: RoomsService, useValue: mockRoomsService },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockAuthGuard)
      .overrideGuard(PermissionsGuard)
      .useValue(mockPermissionsGuard)
      .compile();

    controller = module.get<RoomsController>(RoomsController);
    service = module.get<RoomsService>(RoomsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should invoke roomsService.createRoom with body payload and request user', async () => {
      const dto: CreateRoomDto = {
        name: 'Office 101',
        category: 'OFFICE',
        floorId: 'flr-123',
      };
      const req = { user: { id: 'user-id-123' } };

      const result = await controller.create(dto, req);
      expect(service.createRoom).toHaveBeenCalledWith(dto, 'user-id-123');
      expect(result).toEqual(mockRoom);
    });
  });

  describe('findAll', () => {
    it('should fetch rooms matched to provided query params', async () => {
      const query: QueryRoomDto = { floorId: 'flr-123', page: 1, limit: 10 };
      const result = await controller.findAll(query);
      expect(service.findAllRooms).toHaveBeenCalledWith(query);
      expect(result.items).toContainEqual(mockRoom);
    });
  });

  describe('findOne', () => {
    it('should retrieve a single room matching param id', async () => {
      const result = await controller.findOne('room-abc');
      expect(service.findRoomById).toHaveBeenCalledWith('room-abc');
      expect(result).toEqual(mockRoom);
    });
  });

  describe('update', () => {
    it('should pass param id, update payload, and current user to update service', async () => {
      const dto: UpdateRoomDto = { name: 'Office 101 Suite' };
      const req = { user: { id: 'user-id-123' } };

      const result = await controller.update('room-abc', dto, req);
      expect(service.updateRoom).toHaveBeenCalledWith('room-abc', dto, 'user-id-123');
      expect(result.name).toBe('Office 101 Suite');
    });
  });

  describe('remove', () => {
    it('should issue soft deletion order via the service layer', async () => {
      const req = { user: { id: 'user-id-123' } };
      const result = await controller.remove('room-abc', req);
      expect(service.softDeleteRoom).toHaveBeenCalledWith('room-abc', 'user-id-123');
      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('restore', () => {
    it('should issue restore instruction to service', async () => {
      const req = { user: { id: 'user-id-123' } };
      const result = await controller.restore('room-abc', req);
      expect(service.restoreRoom).toHaveBeenCalledWith('room-abc', 'user-id-123');
      expect(result.deletedAt).toBeNull();
    });
  });
});
