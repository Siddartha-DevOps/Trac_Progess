import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersRepository {
  private readonly logger = new Logger(UsersRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateUserDto, passwordHash: string) {
    this.logger.log(`Inserting new User into database: ${createDto.email}`);
    
    // Default preferences block
    const defaultPreferences = {
      theme: 'light',
      emailNotifications: true,
      smsNotifications: false,
      language: 'en-IN',
    };

    return this.prisma.user.create({
      data: {
        email: createDto.email.toLowerCase().trim(),
        passwordHash,
        firstName: createDto.firstName,
        lastName: createDto.lastName,
        phoneNumber: createDto.phoneNumber || null,
        role: createDto.role,
        organizationId: createDto.organizationId,
        preferences: defaultPreferences,
      },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    this.logger.log(`Updating database record for User ID: ${id}`);
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async findById(id: string, includeDeleted = false) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (user && user.deletedAt && !includeDeleted) {
      return null;
    }

    return user;
  }

  async findByEmail(email: string, includeDeleted = false) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (user && user.deletedAt && !includeDeleted) {
      return null;
    }

    return user;
  }

  async findByPhone(phoneNumber: string, includeDeleted = false) {
    const user = await this.prisma.user.findFirst({
      where: { phoneNumber },
    });

    if (user && user.deletedAt && !includeDeleted) {
      return null;
    }

    return user;
  }

  async findByVerificationToken(token: string) {
    return this.prisma.user.findFirst({
      where: { verificationToken: token, deletedAt: null },
    });
  }

  async findByResetToken(token: string) {
    return this.prisma.user.findFirst({
      where: { passwordResetToken: token, deletedAt: null },
    });
  }

  async findByInvitationToken(token: string) {
    return this.prisma.user.findFirst({
      where: { invitationToken: token, deletedAt: null },
    });
  }

  async findAll(queryDto: QueryUserDto) {
    const {
      search,
      role,
      organizationId,
      isActive,
      isEmailVerified,
      page = 1,
      limit = 10,
      includeDeleted = false,
    } = queryDto;
    
    const skip = (page - 1) * limit;
    const where: Prisma.UserWhereInput = {};

    // 1. Soft delete filter
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    // 2. Keyword Search filter
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // 3. Exact field filters
    if (role) {
      where.role = role;
    }
    if (organizationId) {
      where.organizationId = organizationId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (isEmailVerified !== undefined) {
      where.isEmailVerified = isEmailVerified;
    }

    this.logger.log(`Executing users paginated query with filters: ${JSON.stringify(where)}`);

    const [items, totalItems] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, totalItems };
  }

  async softDelete(id: string) {
    this.logger.log(`Setting soft-delete timestamp for User ID: ${id}`);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });
  }

  async restore(id: string) {
    this.logger.log(`Restoring soft-deleted record for User ID: ${id}`);
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: null, isActive: true },
    });
  }

  async hardDelete(id: string) {
    this.logger.log(`Executing hard delete for User ID: ${id}`);
    return this.prisma.user.delete({
      where: { id },
    });
  }
}
