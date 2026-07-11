import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { RbacRepository } from './rbac.repository';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { QueryRoleDto } from './dto/query-role.dto';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { QueryPermissionDto } from './dto/query-permission.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class RbacService {
  private readonly logger = new Logger(RbacService.name);

  constructor(
    private readonly rbacRepository: RbacRepository,
    private readonly prisma: PrismaService,
  ) {}

  // ==========================================
  // ROLE LOGICAL OPERATIONS
  // ==========================================

  async createRole(createDto: CreateRoleDto) {
    const existing = await this.rbacRepository.findRoleByName(createDto.name, true);
    if (existing) {
      if (existing.deletedAt) {
        this.logger.log(`Found soft-deleted role matching name [${createDto.name}]. Restoring role.`);
        await this.rbacRepository.restoreRole(existing.id);
        return this.rbacRepository.updateRole(existing.id, { description: createDto.description });
      }
      throw new ConflictException(`Role designation [${createDto.name}] already exists in organization.`);
    }

    try {
      return await this.rbacRepository.createRole(createDto);
    } catch (err) {
      this.logger.error(`Error inserting role ${createDto.name}: ${err.message}`);
      throw new BadRequestException('Failed to create the specified role.');
    }
  }

  async updateRole(id: string, updateDto: UpdateRoleDto) {
    const role = await this.rbacRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundException(`Privilege role with ID [${id}] does not exist.`);
    }
    return this.rbacRepository.updateRole(id, updateDto);
  }

  async getRole(id: string) {
    const role = await this.rbacRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundException(`Privilege role with ID [${id}] does not exist.`);
    }
    return role;
  }

  async getAllRoles(queryDto: QueryRoleDto) {
    const { items, totalItems } = await this.rbacRepository.findAllRoles(queryDto);
    
    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: queryDto.limit,
        totalPages: Math.ceil(totalItems / queryDto.limit) || 1,
        currentPage: queryDto.page,
      },
    };
  }

  async deleteRole(id: string) {
    const role = await this.rbacRepository.findRoleById(id);
    if (!role) {
      throw new NotFoundException(`Privilege role with ID [${id}] does not exist.`);
    }
    
    // Prevent deleting Admin role
    if (role.name.toLowerCase() === 'admin') {
      throw new BadRequestException('Security protection constraint: Cannot delete core Super Admin role.');
    }

    await this.rbacRepository.softDeleteRole(id);
    return { success: true, message: `Role [${role.name}] has been soft-deleted.` };
  }

  async restoreRole(id: string) {
    const role = await this.rbacRepository.findRoleById(id, true);
    if (!role) {
      throw new NotFoundException(`Privilege role with ID [${id}] does not exist.`);
    }
    await this.rbacRepository.restoreRole(id);
    return { success: true, message: `Role [${role.name}] has been successfully restored.` };
  }

  // ==========================================
  // PERMISSION LOGICAL OPERATIONS
  // ==========================================

  async createPermission(createDto: CreatePermissionDto) {
    const existing = await this.rbacRepository.findPermissionByName(createDto.name);
    if (existing) {
      throw new ConflictException(`Permission key [${createDto.name}] is already registered.`);
    }

    try {
      return await this.rbacRepository.createPermission(createDto);
    } catch (err) {
      this.logger.error(`Error inserting permission ${createDto.name}: ${err.message}`);
      throw new BadRequestException('Failed to register the specified permission.');
    }
  }

  async updatePermission(id: string, updateDto: UpdatePermissionDto) {
    const perm = await this.rbacRepository.findPermissionById(id);
    if (!perm) {
      throw new NotFoundException(`Permission key with ID [${id}] does not exist.`);
    }
    return this.rbacRepository.updatePermission(id, updateDto);
  }

  async getPermission(id: string) {
    const perm = await this.rbacRepository.findPermissionById(id);
    if (!perm) {
      throw new NotFoundException(`Permission key with ID [${id}] does not exist.`);
    }
    return perm;
  }

  async getAllPermissions(queryDto: QueryPermissionDto) {
    const { items, totalItems } = await this.rbacRepository.findAllPermissions(queryDto);

    return {
      items,
      meta: {
        totalItems,
        itemCount: items.length,
        itemsPerPage: queryDto.limit,
        totalPages: Math.ceil(totalItems / queryDto.limit) || 1,
        currentPage: queryDto.page,
      },
    };
  }

  async deletePermission(id: string) {
    const perm = await this.rbacRepository.findPermissionById(id);
    if (!perm) {
      throw new NotFoundException(`Permission key with ID [${id}] does not exist.`);
    }
    await this.rbacRepository.deletePermission(id);
    return { success: true, message: `Permission [${perm.name}] deleted from enterprise space.` };
  }

  // ==========================================
  // ROLE-PERMISSION CONNECTIONS
  // ==========================================

  async assignPermissionsToRole(roleIdOrName: string, assignDto: AssignPermissionsDto) {
    // 1. Find role
    let role = await this.rbacRepository.findRoleById(roleIdOrName);
    if (!role) {
      role = await this.rbacRepository.findRoleByName(roleIdOrName);
    }

    if (!role) {
      throw new NotFoundException(`Target security role [${roleIdOrName}] does not exist.`);
    }

    // 2. Resolve permission list keys (IDs or names) to unique database IDs
    const resolvedPermissionIds: string[] = [];
    for (const key of assignDto.permissions) {
      let perm = await this.rbacRepository.findPermissionById(key);
      if (!perm) {
        perm = await this.rbacRepository.findPermissionByName(key);
      }

      // If the permission key doesn't exist, register it automatically to make developer assignments seamless
      if (!perm) {
        this.logger.log(`Auto-registering missing permission key: ${key}`);
        perm = await this.rbacRepository.createPermission({
          name: key,
          description: `Auto-generated permission fallback.`,
        });
      }

      resolvedPermissionIds.push(perm.id);
    }

    // 3. Connect permissions to role
    const updatedRole = await this.rbacRepository.assignPermissionsToRole(role.id, resolvedPermissionIds);
    this.logger.log(`Configured ${resolvedPermissionIds.length} permissions for Role [${role.name}] successfully.`);

    return {
      success: true,
      message: `Successfully mapped and synchronized ${resolvedPermissionIds.length} permissions for security role [${role.name}].`,
      role: updatedRole,
    };
  }

  // ==========================================
  // USER-ROLE CONNECTIONS
  // ==========================================

  async assignRoleToUser(assignDto: AssignRoleDto) {
    // 1. Find the target user
    const user = await this.prisma.user.findUnique({
      where: { id: assignDto.userId },
    });

    if (!user) {
      throw new NotFoundException(`Specified target User with ID [${assignDto.userId}] could not be located.`);
    }

    // 2. Find the target role
    let role = await this.rbacRepository.findRoleByName(assignDto.roleName);
    if (!role) {
      role = await this.rbacRepository.findRoleById(assignDto.roleName);
    }

    if (!role) {
      this.logger.log(`Target assignment role [${assignDto.roleName}] not found. Creating a new role dynamically.`);
      role = await this.rbacRepository.createRole({
        name: assignDto.roleName,
        description: 'Dynamically initialized security role clearance.',
      });
    }

    // 3. Persist the user-role connection
    await this.rbacRepository.assignRoleToUser(user.id, role.id, role.name);

    return {
      success: true,
      message: `Successfully promoted User [${user.firstName} ${user.lastName}] to privilege class [${role.name}].`,
    };
  }
}
