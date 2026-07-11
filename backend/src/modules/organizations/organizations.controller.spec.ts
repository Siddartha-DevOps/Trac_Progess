import { Test, TestingModule } from '@nestjs/testing';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { QueryOrganizationDto } from './dto/query-organization.dto';

describe('OrganizationsController', () => {
  let controller: OrganizationsController;
  let mockService: any;

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
    mockService = {
      create: jest.fn(),
      update: jest.fn(),
      findOne: jest.fn(),
      findOneBySlug: jest.fn(),
      findAll: jest.fn(),
      softDelete: jest.fn(),
      restore: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrganizationsController],
      providers: [{ provide: OrganizationsService, useValue: mockService }],
    }).compile();

    controller = module.get<OrganizationsController>(OrganizationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateOrganizationDto = {
      name: 'Godrej Properties',
      slug: 'godrej-prop',
      reraLicense: 'RERA-GP-1234',
    };

    it('should delegate creation to service', async () => {
      mockService.create.mockResolvedValue(mockOrg);
      const req = { user: { id: 'usr-id-123' } };

      const result = await controller.create(createDto, req);

      expect(result).toEqual(mockOrg);
      expect(mockService.create).toHaveBeenCalledWith(createDto, 'usr-id-123');
    });
  });

  describe('findOne', () => {
    it('should delegate primary-key fetches to service', async () => {
      mockService.findOne.mockResolvedValue(mockOrg);

      const result = await controller.findOne('org-uuid-112233');

      expect(result).toEqual(mockOrg);
      expect(mockService.findOne).toHaveBeenCalledWith('org-uuid-112233');
    });
  });

  describe('findOneBySlug', () => {
    it('should delegate slug fetches to service', async () => {
      mockService.findOneBySlug.mockResolvedValue(mockOrg);

      const result = await controller.findOneBySlug('godrej-prop');

      expect(result).toEqual(mockOrg);
      expect(mockService.findOneBySlug).toHaveBeenCalledWith('godrej-prop');
    });
  });

  describe('findAll', () => {
    const queryDto: QueryOrganizationDto = { page: 1, limit: 10, search: 'Godrej' };

    it('should delegate filtered list queries to service', async () => {
      const mockList = { items: [mockOrg], meta: { totalItems: 1 } };
      mockService.findAll.mockResolvedValue(mockList);

      const result = await controller.findAll(queryDto);

      expect(result).toEqual(mockList);
      expect(mockService.findAll).toHaveBeenCalledWith(queryDto);
    });
  });

  describe('update', () => {
    const updateDto: UpdateOrganizationDto = { name: 'Godrej Holdings' };

    it('should delegate update pipelines to service', async () => {
      const updatedOrg = { ...mockOrg, name: 'Godrej Holdings' };
      mockService.update.mockResolvedValue(updatedOrg);
      const req = { user: { id: 'usr-id-123' } };

      const result = await controller.update('org-uuid-112233', updateDto, req);

      expect(result).toEqual(updatedOrg);
      expect(mockService.update).toHaveBeenCalledWith('org-uuid-112233', updateDto, 'usr-id-123');
    });
  });

  describe('softDelete', () => {
    it('should delegate deletion request to service', async () => {
      mockService.softDelete.mockResolvedValue(mockOrg);
      const req = { user: { id: 'usr-id-123' } };

      const result = await controller.softDelete('org-uuid-112233', req);

      expect(result).toEqual(mockOrg);
      expect(mockService.softDelete).toHaveBeenCalledWith('org-uuid-112233', 'usr-id-123');
    });
  });

  describe('restore', () => {
    it('should delegate recovery request to service', async () => {
      mockService.restore.mockResolvedValue(mockOrg);
      const req = { user: { id: 'usr-id-123' } };

      const result = await controller.restore('org-uuid-112233', req);

      expect(result).toEqual(mockOrg);
      expect(mockService.restore).toHaveBeenCalledWith('org-uuid-112233', 'usr-id-123');
    });
  });
});
