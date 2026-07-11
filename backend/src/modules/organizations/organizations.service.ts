import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { OrganizationsRepository } from './organizations.repository';
import { AuditService } from '../../common/audit/audit.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { QueryOrganizationDto } from './dto/query-organization.dto';
import { OrganizationResponseDto, PaginatedOrganizationResponseDto } from './dto/organization-response.dto';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    private readonly repository: OrganizationsRepository,
    private readonly auditService: AuditService,
  ) {}

  async create(createDto: CreateOrganizationDto, actorUserId?: string): Promise<OrganizationResponseDto> {
    this.logger.log(`Beginning Organization creation pipeline for slug: ${createDto.slug}`);

    // 1. Validate slug uniqueness (including soft-deleted ones to avoid physical conflicts)
    const existingSlug = await this.repository.findBySlug(createDto.slug, true);
    if (existingSlug) {
      throw new ConflictException(`An organization with the URL slug [${createDto.slug}] already exists.`);
    }

    // 2. Validate RERA license uniqueness if provided
    if (createDto.reraLicense) {
      const existingRera = await this.repository.findByReraLicense(createDto.reraLicense, true);
      if (existingRera) {
        throw new ConflictException(`An organization with RERA license [${createDto.reraLicense}] is already registered.`);
      }
    }

    // 3. Create the database record
    const organization = await this.repository.create(createDto);

    // 4. Record high-integrity audit log trail
    await this.auditService.log({
      action: 'INSERT',
      tableName: 'Organization',
      recordId: organization.id,
      newValues: organization,
      userId: actorUserId,
      organizationId: organization.id,
    });

    this.logger.log(`Successfully created Organization ID: ${organization.id}`);
    return organization;
  }

  async update(id: string, updateDto: UpdateOrganizationDto, actorUserId?: string): Promise<OrganizationResponseDto> {
    this.logger.log(`Beginning Organization update pipeline for ID: ${id}`);

    // 1. Validate target existence
    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException(`Organization with ID [${id}] not found or has been soft-deleted.`);
    }

    // 2. Validate unique slug conflict if modified
    if (updateDto.slug && updateDto.slug !== current.slug) {
      const existingSlug = await this.repository.findBySlug(updateDto.slug, true);
      if (existingSlug) {
        throw new ConflictException(`An organization with URL slug [${updateDto.slug}] already exists.`);
      }
    }

    // 3. Validate unique RERA License conflict if modified
    if (updateDto.reraLicense && updateDto.reraLicense !== current.reraLicense) {
      const existingRera = await this.repository.findByReraLicense(updateDto.reraLicense, true);
      if (existingRera) {
        throw new ConflictException(`An organization with RERA license [${updateDto.reraLicense}] is already registered.`);
      }
    }

    // 4. Update and capture historical transitions
    const updated = await this.repository.update(id, updateDto);

    // 5. Save audit log trail
    await this.auditService.log({
      action: 'UPDATE',
      tableName: 'Organization',
      recordId: id,
      oldValues: current,
      newValues: updated,
      userId: actorUserId,
      organizationId: id,
    });

    this.logger.log(`Successfully updated Organization ID: ${id}`);
    return updated;
  }

  async findOne(id: string, includeDeleted = false): Promise<OrganizationResponseDto> {
    this.logger.log(`Retrieving Organization ID: ${id} (IncludeDeleted: ${includeDeleted})`);
    const organization = await this.repository.findById(id, includeDeleted);
    
    if (!organization) {
      throw new NotFoundException(`Organization with ID [${id}] does not exist.`);
    }

    return organization;
  }

  async findOneBySlug(slug: string): Promise<OrganizationResponseDto> {
    this.logger.log(`Retrieving Organization by slug: ${slug}`);
    const organization = await this.repository.findBySlug(slug);
    
    if (!organization) {
      throw new NotFoundException(`Organization with slug [${slug}] does not exist.`);
    }

    return organization;
  }

  async findAll(queryDto: QueryOrganizationDto): Promise<PaginatedOrganizationResponseDto> {
    this.logger.log(`Retrieving paginated Organization list: page=${queryDto.page}, limit=${queryDto.limit}`);
    
    const { items, totalItems } = await this.repository.findAll(queryDto);
    const totalPages = Math.ceil(totalItems / (queryDto.limit || 10)) || 1;

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: queryDto.limit || 10,
        totalPages,
        currentPage: queryDto.page || 1,
      },
    };
  }

  async softDelete(id: string, actorUserId?: string): Promise<OrganizationResponseDto> {
    this.logger.log(`Initiating soft delete pipeline for Organization ID: ${id}`);

    const current = await this.repository.findById(id);
    if (!current) {
      throw new NotFoundException(`Organization with ID [${id}] was not found or is already soft-deleted.`);
    }

    const updated = await this.repository.softDelete(id);

    // Audit log soft delete event
    await this.auditService.log({
      action: 'DELETE',
      tableName: 'Organization',
      recordId: id,
      oldValues: current,
      newValues: updated,
      userId: actorUserId,
      organizationId: id,
    });

    this.logger.log(`Successfully soft-deleted Organization ID: ${id}`);
    return updated;
  }

  async restore(id: string, actorUserId?: string): Promise<OrganizationResponseDto> {
    this.logger.log(`Initiating restoration pipeline for soft-deleted Organization ID: ${id}`);

    const current = await this.repository.findById(id, true);
    if (!current) {
      throw new NotFoundException(`Organization with ID [${id}] does not exist.`);
    }

    if (!current.deletedAt) {
      throw new BadRequestException(`Organization with ID [${id}] is active and does not require restoration.`);
    }

    const updated = await this.repository.restore(id);

    // Audit log restoration
    await this.auditService.log({
      action: 'RESTORE',
      tableName: 'Organization',
      recordId: id,
      oldValues: current,
      newValues: updated,
      userId: actorUserId,
      organizationId: id,
    });

    this.logger.log(`Successfully restored soft-deleted Organization ID: ${id}`);
    return updated;
  }
}
