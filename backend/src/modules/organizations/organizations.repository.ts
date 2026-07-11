import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { QueryOrganizationDto } from './dto/query-organization.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class OrganizationsRepository {
  private readonly logger = new Logger(OrganizationsRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateOrganizationDto) {
    this.logger.log(`Inserting new Organization into database: ${createDto.slug}`);
    return this.prisma.organization.create({
      data: {
        name: createDto.name,
        slug: createDto.slug,
        reraLicense: createDto.reraLicense || null,
      },
    });
  }

  async update(id: string, updateDto: UpdateOrganizationDto) {
    this.logger.log(`Updating database record for Organization ID: ${id}`);
    const data: Prisma.OrganizationUpdateInput = {};

    if (updateDto.name !== undefined) data.name = updateDto.name;
    if (updateDto.slug !== undefined) data.slug = updateDto.slug;
    if (updateDto.reraLicense !== undefined) data.reraLicense = updateDto.reraLicense;

    return this.prisma.organization.update({
      where: { id },
      data,
    });
  }

  async findById(id: string, includeDeleted = false) {
    const where: Prisma.OrganizationWhereUniqueInput = { id };
    
    // If we shouldn't include deleted, query using standard non-deleted filter
    const org = await this.prisma.organization.findUnique({
      where,
    });

    if (org && org.deletedAt && !includeDeleted) {
      return null;
    }

    return org;
  }

  async findBySlug(slug: string, includeDeleted = false) {
    const org = await this.prisma.organization.findUnique({
      where: { slug },
    });

    if (org && org.deletedAt && !includeDeleted) {
      return null;
    }

    return org;
  }

  async findByReraLicense(reraLicense: string, includeDeleted = false) {
    const org = await this.prisma.organization.findFirst({
      where: { reraLicense },
    });

    if (org && org.deletedAt && !includeDeleted) {
      return null;
    }

    return org;
  }

  async findAll(queryDto: QueryOrganizationDto) {
    const { search, page = 1, limit = 10, includeDeleted = false, createdAtStart, createdAtEnd } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.OrganizationWhereInput = {};

    // 1. Soft delete filter
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    // 2. Search filter (matching Name, Slug or RERA License)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { reraLicense: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 3. Date Range Filters
    if (createdAtStart || createdAtEnd) {
      where.createdAt = {};
      if (createdAtStart) {
        where.createdAt.gte = new Date(createdAtStart);
      }
      if (createdAtEnd) {
        where.createdAt.lte = new Date(createdAtEnd);
      }
    }

    this.logger.log(`Executing paginated fetch with filters: ${JSON.stringify(where)}`);

    // Fetch records and aggregate count in parallel
    const [items, totalItems] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return { items, totalItems };
  }

  async softDelete(id: string) {
    this.logger.log(`Setting soft-delete timestamp for Organization ID: ${id}`);
    return this.prisma.organization.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restore(id: string) {
    this.logger.log(`Restoring soft-deleted record for Organization ID: ${id}`);
    return this.prisma.organization.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async hardDelete(id: string) {
    this.logger.log(`Executing absolute HARD delete from database for Organization ID: ${id}`);
    return this.prisma.organization.delete({
      where: { id },
    });
  }
}
