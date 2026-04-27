import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }
    const { user, role } = context.switchToHttp().getRequest();

    if (!user || !requiredRoles.includes(role)) {
      throw new ForbiddenException('You do not have permission to access this resource');
    }

    return true;
  }
}