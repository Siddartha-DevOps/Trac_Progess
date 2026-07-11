import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied. No authentication context found.');
    }

    const hasRole = requiredRoles.some((role) => user.role.toLowerCase() === role.toLowerCase());
    if (!hasRole) {
      throw new ForbiddenException(
        `Access denied. Your role [${user.role}] does not possess permissions required for this resource [Required: ${requiredRoles.join(', ')}]`,
      );
    }

    return true;
  }
}
