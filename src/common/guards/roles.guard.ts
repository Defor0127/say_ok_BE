import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '@/common/decorators/roles.decorator';
import { Role } from '@/user/enum/role.enum';

@Injectable()
// nest가 guard로 인식하도록.
export class RolesGuard implements CanActivate {
  // reflector = 컨트롤러/메서드에 설정된 메타데이터 가져옴.
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 먼저 발견된 값으로 덮어씀.
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('인증 정보가 없습니다.');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('대상에 대한 접근 권한이 없습니다.');
    }

    return true;
  }
}

