import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class RbacRepository {
  private readonly logger = new Logger(RbacRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  // ==========================================
  // ROLE CRUD OPERATIONS
  // ==========================================

  async createRole(createDto: CreateRoleDto) {
    this.logger.log(`Inserting new Role into database: ${createDto.name}`);
    return this.prisma.role.create({
      data: {
        name: createDto.name.trim(),
        description: createDto.description || null,
      },
    });
  }

  async updateRole(id: string, updateDto: UpdateRoleDto) {
    this.logger.log(`Updating Role record with ID: ${id}`);
    return this.prisma.role.update({
      where: { id },
      data: {
        description: updateDto.description !== undefined ? updateDto.description : undefined,
      },
    });
  }

  async findRoleById(id: string, includeDeleted = false) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (role && role.deletedAt && !includeDeleted) {
      return null;
    }

    return this.flattenRolePermissions(role);
  }

  async findRoleByName(name: string, includeDeleted = false) {
    const role = await this.prisma.role.findFirst({
      where: { name: { equals: name.trim(), mode: 'insensitive' } },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (role && role.deletedAt && !includeDeleted) {
      return null;
    }

    return this.flattenRolePermissions(role);
  }

  async findAllRoles(queryDto: QueryRoleDto) {
    const { search, page = 1, limit = 10, includeDeleted = false } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.RoleWhereInput = {};

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    this.logger.log(`Executing roles query with filters: ${JSON.stringify(where)}`);

    const [items, totalItems] = await Promise.all([
      this.prisma.role.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      }),
      this.prisma.role.count({ where }),
    ]);

    const flattenedItems = items.map((r) => this.flattenRolePermissions(r));

    return { items: flattenedItems, totalItems };
  }

  async softDeleteRole(id: string) {
    this.logger.log(`Setting soft-delete timestamp for Role ID: ${id}`);
    return this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async restoreRole(id: string) {
    this.logger.log(`Restoring soft-deleted Role ID: ${id}`);
    return this.prisma.role.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  // ==========================================
  // PERMISSION CRUD OPERATIONS
  // ==========================================

  async createPermission(createDto: CreatePermissionDto) {
    this.logger.log(`Inserting new Permission into database: ${createDto.name}`);
    return this.prisma.permission.create({
      data: {
        name: createDto.name.toLowerCase().trim(),
        description: createDto.description || null,
      },
    });
  }

  async updatePermission(id: string, updateDto: UpdatePermissionDto) {
    this.logger.log(`Updating Permission record ID: ${id}`);
    return this.prisma.permission.update({
      where: { id },
      data: {
        description: updateDto.description !== undefined ? updateDto.description : undefined,
      },
    });
  }

  async findPermissionById(id: string) {
    return this.prisma.permission.findUnique({
      where: { id },
    });
  }

  async findPermissionByName(name: string) {
    return this.prisma.permission.findUnique({
      where: { name: name.toLowerCase().trim() },
    });
  }

  async findAllPermissions(queryDto: QueryPermissionDto) {
    const { search, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.PermissionWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    this.logger.log(`Executing permissions query with filters: ${JSON.stringify(where)}`);

    const [items, totalItems] = await Promise.all([
      this.prisma.permission.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.permission.count({ where }),
    ]);

    return { items, totalItems };
  }

  async deletePermission(id: string) {
    this.logger.log(`Executing hard delete for Permission ID: ${id}`);
    return this.prisma.permission.delete({
      where: { id },
    });
  }

  // ==========================================
  // ROLE-PERMISSION ASSIGNMENTS (MANY-TO-MANY)
  // ==========================================

  async assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    this.logger.log(`Assigning ${permissionIds.length} permissions to Role ID: ${roleId}`);

    // Execute in a transaction to guarantee consistency
    return this.prisma.$transaction(async (tx) => {
      // 1. Delete all existing permission links for this role
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // 2. Insert new permission connections
      if (permissionIds.length > 0) {
        const createData = permissionIds.map((pId) => ({
          roleId,
          permissionId: pId,
        }));

        await tx.rolePermission.createMany({
          data: createData,
        });
      }

      // 3. Return the updated role with newly linked permissions
      return tx.role.findUnique({
        where: { id: roleId },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });
  }

  // ==========================================
  // USER ROLE ASSIGNMENT
  // ==========================================

  async assignRoleToUser(userId: string, roleId: string, roleName: string) {
    this.logger.log(`Assigning Role [${roleName}] (ID: ${roleId}) to User ID: ${userId}`);
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        roleId,
        role: roleName, // synchronize legacy/convenient role string
      },
    });
  }

  // ==========================================
  // PRIVATE HELPER TO CLEAN PRISMA NESTED JOIN OBJECTS
  // ==========================================

  private flattenRolePermissions(role: any) {
    if (!role) return null;
    
    const permissions = role.permissions
      ? role.permissions.map((rp: any) => rp.permission)
      : [];
      
    const { permissions: _, ...cleanRole } = role;
    return {
      ...cleanRole,
      permissions,
    };
  }
}
