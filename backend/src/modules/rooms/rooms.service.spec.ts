import { Test, TestingModule } from '@nestjs/testing';
import { RoomsService } from './rooms.service';
import { RoomsRepository } from './rooms.repository';
import { AuditService } from '../../common/audit/audit.service';
import { PrismaService } from '../../common/prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('RoomsService Unit Tests', () => {
  let service: RoomsService;
  let repo: RoomsRepository;
  let prisma: PrismaService;
  let audit: AuditService;

  const mockFloor = { id: 'flr-123', name: 'Floor 1', number: 1, buildingId: 'bld-123' };
  const mockBuilding = { id: 'bld-123', name: 'Tower A', projectId: 'project-123' };
  const mockProject = { id: 'project-123', name: 'Tech Hub', organizationId: 'org-456' };
  const mockRoom = {
    id: 'room-abc',
    name: 'Office 101',
    category: 'OFFICE',
    status: 'PLANNING',
    description: 'Corner office',
    totalArea: 150.0,
    height: 9.0,
    perimeter: 50.0,
    geometry: { type: 'Polygon' },
    metadata: { key: 'value' },
    floorId: 'flr-123',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    const mockRoomsRepository = {
      createRoom: jest.fn().mockResolvedValue(mockRoom),
      updateRoom: jest.fn().mockResolvedValue({ ...mockRoom, name: 'Office 101 Suite' }),
      findRoomById: jest.fn().mockImplementation((id, includeDeleted) => {
        if (id === 'room-abc') {
          return Promise.resolve({
            ...mockRoom,
            floor: {
              ...mockFloor,
              building: {
                ...mockBuilding,
                project: mockProject,
              },
            },
          });
        }
        return Promise.resolve(null);
      }),
      findRoomByNameAndFloor: jest.fn().mockResolvedValue(null),
      findAllRooms: jest.fn().mockResolvedValue({ items: [mockRoom], totalItems: 1 }),
      softDeleteRoom: jest.fn().mockResolvedValue({ ...mockRoom, deletedAt: new Date() }),
      restoreRoom: jest.fn().mockResolvedValue({ ...mockRoom, deletedAt: null }),
    };

    const mockAuditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const mockPrismaService = {
      floor: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'flr-123') {
            return Promise.resolve({
              ...mockFloor,
              building: {
                ...mockBuilding,
                project: mockProject,
              },
            });
          }
          return Promise.resolve(null);
        }),
      },
      project: {
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.id === 'project-123') {
            return Promise.resolve(mockProject);
          }
          return Promise.resolve(null);
        }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoomsService,
        { provide: RoomsRepository, useValue: mockRoomsRepository },
        { provide: AuditService, useValue: mockAuditService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RoomsService>(RoomsService);
    repo = module.get<RoomsRepository>(RoomsRepository);
    prisma = module.get<PrismaService>(PrismaService);
    audit = module.get<AuditService>(AuditService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createRoom', () => {
    const createDto = {
      name: 'Office 101',
      category: 'OFFICE',
      floorId: 'flr-123',
    };

    it('should successfully create a room if floor exists and attributes are unique', async () => {
      const result = await service.createRoom(createDto, 'user-999');
      expect(prisma.floor.findUnique).toHaveBeenCalledWith({ where: { id: 'flr-123', deletedAt: null }, include: { building: { select: { id: true, projectId: true, project: { select: { id: true, organizationId: true } } } } } });
      expect(repo.findRoomByNameAndFloor).toHaveBeenCalledWith('Office 101', 'flr-123');
      expect(repo.createRoom).toHaveBeenCalled();
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'INSERT', tableName: 'Room', recordId: 'room-abc' }),
      );
      expect(result).toEqual(mockRoom);
    });

    it('should throw NotFoundException if parent floor does not exist', async () => {
      jest.spyOn(prisma.floor, 'findUnique').mockResolvedValueOnce(null);
      await expect(service.createRoom(createDto, 'user-999')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if room designation already exists in same floor', async () => {
      jest.spyOn(repo, 'findRoomByNameAndFloor').mockResolvedValueOnce(mockRoom as any);
      await expect(service.createRoom(createDto, 'user-999')).rejects.toThrow(ConflictException);
    });
  });

  describe('updateRoom', () => {
    const updateDto = { name: 'Office 101 Suite' };

    it('should successfully update of an existing room', async () => {
      const result = await service.updateRoom('room-abc', updateDto, 'user-999');
      expect(repo.findRoomById).toHaveBeenCalledWith('room-abc');
      expect(repo.updateRoom).toHaveBeenCalledWith('room-abc', updateDto);
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'UPDATE', tableName: 'Room', recordId: 'room-abc' }),
      );
      expect(result.name).toBe('Office 101 Suite');
    });

    it('should throw NotFoundException if room to update does not exist', async () => {
      await expect(service.updateRoom('missing-id', updateDto, 'user-999')).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException if updated name duplicates another room on same floor', async () => {
      const conflictRoom = { ...mockRoom, id: 'room-xyz', name: 'Conference A' };
      jest.spyOn(repo, 'findRoomByNameAndFloor').mockResolvedValueOnce(conflictRoom as any);
      await expect(service.updateRoom('room-abc', { name: 'Conference A' }, 'user-999')).rejects.toThrow(ConflictException);
    });
  });

  describe('findRoomById', () => {
    it('should return room details if room exists', async () => {
      const result = await service.findRoomById('room-abc');
      expect(repo.findRoomById).toHaveBeenCalledWith('room-abc');
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException if room ID does not exist', async () => {
      await expect(service.findRoomById('missing-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDeleteRoom', () => {
    it('should trigger soft-delete with timestamp and log to audit', async () => {
      const result = await service.softDeleteRoom('room-abc', 'user-999');
      expect(repo.findRoomById).toHaveBeenCalledWith('room-abc');
      expect(repo.softDeleteRoom).toHaveBeenCalledWith('room-abc');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'DELETE', tableName: 'Room', recordId: 'room-abc' }),
      );
      expect(result.deletedAt).toBeDefined();
    });
  });

  describe('restoreRoom', () => {
    it('should reset deletedAt to null for soft-deleted room', async () => {
      const deletedRoom = {
        ...mockRoom,
        deletedAt: new Date(),
        floor: {
          ...mockFloor,
          building: {
            ...mockBuilding,
            project: mockProject,
          },
        },
      };
      jest.spyOn(repo, 'findRoomById').mockResolvedValueOnce(deletedRoom as any);

      const result = await service.restoreRoom('room-abc', 'user-999');
      expect(repo.findRoomById).toHaveBeenCalledWith('room-abc', true);
      expect(repo.restoreRoom).toHaveBeenCalledWith('room-abc');
      expect(audit.log).toHaveBeenCalledWith(
        expect.objectContaining({ action: 'RESTORE', tableName: 'Room', recordId: 'room-abc' }),
      );
      expect(result.deletedAt).toBeNull();
    });
  });
});
