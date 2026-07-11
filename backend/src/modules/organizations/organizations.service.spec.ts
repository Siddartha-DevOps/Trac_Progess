import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { OrganizationsRepository } from './organizations.repository';
import { AuditService } from '../../common/audit/audit.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let mockRepository: any;
  let mockAuditService: any;

  const mockOrg = {
    id: 'org-uuid-112233',
    name: 'Godrej Properties',
    slug: 'godrej-prop',
    reraLicense: 'RERA-GP-1234',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(async () => {
    mockRepository = {
      create: jest.fn(),
      update: jest.fn(),
      findById: jest.fn(),
      findBySlug: jest.fn(),
      findByReraLicense: jest.fn(),
      findAll: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
    };

    mockAuditService = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: OrganizationsRepository, useValue: mockRepository },
        { provide: AuditService, useValue: mockAuditService },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateOrganizationDto = {
      name: 'Godrej Properties',
      slug: 'godrej-prop',
      reraLicense: 'RERA-GP-1234',
    };

    it('should successfully register a new organization', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);
      mockRepository.findByReraLicense.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockOrg);

      const result = await service.create(createDto, 'actor-user-123');

      expect(result).toEqual(mockOrg);
      expect(mockRepository.findBySlug).toHaveBeenCalledWith('godrej-prop', true);
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'INSERT',
          tableName: 'Organization',
          recordId: mockOrg.id,
        }),
      );
    });

    it('should throw ConflictException if slug already exists', async () => {
      mockRepository.findBySlug.mockResolvedValue(mockOrg);

      await expect(service.create(createDto, 'actor-user-123')).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException if RERA license already exists', async () => {
      mockRepository.findBySlug.mockResolvedValue(null);
      mockRepository.findByReraLicense.mockResolvedValue(mockOrg);

      await expect(service.create(createDto, 'actor-user-123')).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return the organization if found', async () => {
      mockRepository.findById.mockResolvedValue(mockOrg);

      const result = await service.findOne('org-uuid-112233');

      expect(result).toEqual(mockOrg);
      expect(mockRepository.findById).toHaveBeenCalledWith('org-uuid-112233', false);
    });

    it('should throw NotFoundException if organization does not exist', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto: UpdateOrganizationDto = { name: 'Godrej Holdings' };

    it('should successfully update organization parameters', async () => {
      mockRepository.findById.mockResolvedValue(mockOrg);
      const updatedOrg = { ...mockOrg, name: 'Godrej Holdings' };
      mockRepository.update.mockResolvedValue(updatedOrg);

      const result = await service.update('org-uuid-112233', updateDto, 'actor-user-123');

      expect(result.name).toEqual('Godrej Holdings');
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          tableName: 'Organization',
          recordId: 'org-uuid-112233',
        }),
      );
    });

    it('should throw NotFoundException if organization is missing', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(service.update('invalid-uuid', updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('softDelete', () => {
    it('should update deletedAt timestamp on soft deletion', async () => {
      mockRepository.findById.mockResolvedValue(mockOrg);
      const deletedOrg = { ...mockOrg, deletedAt: new Date() };
      mockRepository.softDelete.mockResolvedValue(deletedOrg);

      const result = await service.softDelete('org-uuid-112233', 'actor-user-123');

      expect(result.deletedAt).not.toBeNull();
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          tableName: 'Organization',
          recordId: 'org-uuid-112233',
        }),
      );
    });
  });

  describe('restore', () => {
    it('should clean deletedAt timestamp on restoration', async () => {
      const softDeletedOrg = { ...mockOrg, deletedAt: new Date() };
      mockRepository.findById.mockResolvedValue(softDeletedOrg);
      mockRepository.restore.mockResolvedValue(mockOrg);

      const result = await service.restore('org-uuid-112233', 'actor-user-123');

      expect(result.deletedAt).toBeNull();
      expect(mockAuditService.log).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'RESTORE',
          tableName: 'Organization',
          recordId: 'org-uuid-112233',
        }),
      );
    });

    it('should throw BadRequestException if record is not soft-deleted', async () => {
      mockRepository.findById.mockResolvedValue(mockOrg);

      await expect(service.restore('org-uuid-112233', 'actor-user-123')).rejects.toThrow(BadRequestException);
    });
  });
});
