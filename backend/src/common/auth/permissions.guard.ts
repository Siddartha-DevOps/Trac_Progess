import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from './permissions.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user || !user.role) {
      throw new ForbiddenException('Access denied. No authenticated user session found.');
    }

    this.logger.log(`Checking permissions for User ID: ${user.id} (${user.role}). Required: ${requiredPermissions.join(', ')}`);

    // 1. Static fallback list: ensures seed-free testing & high out-of-the-box reliability
    const staticPermissionMap: Record<string, string[]> = {
      admin: [
        '*', // Wilcard permissions for super-admin
        'users:create',
        'users:read',
        'users:update',
        'users:delete',
        'users:invite',
        'organizations:create',
        'organizations:read',
        'organizations:update',
        'organizations:delete',
        'rbac:roles:create',
        'rbac:roles:read',
        'rbac:roles:update',
        'rbac:roles:delete',
        'rbac:permissions:create',
        'rbac:permissions:read',
        'rbac:permissions:update',
        'rbac:permissions:delete',
        'rbac:assign',
      ],
      siteengineer: [
        'users:read',
        'organizations:read',
        'anomalies:create',
        'anomalies:read',
        'anomalies:update',
        'models:view',
      ],
      auditor: [
        'users:read',
        'organizations:read',
        'anomalies:read',
        'reports:create',
        'reports:read',
      ],
    };

    const userRoleLower = user.role.toLowerCase();
    let permissions: string[] = staticPermissionMap[userRoleLower] || [];

    // 2. Dynamic Relational Database check
    try {
      // Find the role and associated permissions in the database
      const dbRole = await this.prisma.role.findFirst({
        where: {
          name: { equals: user.role, mode: 'insensitive' },
          deletedAt: null,
        },
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      });

      if (dbRole && dbRole.permissions.length > 0) {
        // If relational database permissions exist, use them
        permissions = dbRole.permissions.map((rp) => rp.permission.name.toLowerCase());
        this.logger.log(`Loaded ${permissions.length} dynamic DB permissions for Role: ${user.role}`);
      }
    } catch (err) {
      this.logger.warn(`Failed to retrieve dynamic permissions from database. Falling back to static security rules. Error: ${err.message}`);
    }

    // 3. Super Admin wildcard check or exact match
    const hasWildcard = permissions.includes('*') || permissions.includes('all');
    if (hasWildcard) {
      return true;
    }

    // Check if user has ALL or ANY of the required permissions
    const hasRequired = requiredPermissions.every((reqPerm) =>
      permissions.includes(reqPerm.toLowerCase()),
    );

    if (!hasRequired) {
      this.logger.warn(`Authorization failure: User ${user.id} lacks requested permissions: ${requiredPermissions.join(', ')}`);
      throw new ForbiddenException(
        `Access denied. Your privilege clearance lacks the permissions: [${requiredPermissions.join(', ')}]`,
      );
    }

    return true;
  }
}
