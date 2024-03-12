import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private requiredAuthority: number) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const userAuthority = request.user?.authority;

    if (!request.user || userAuthority < this.requiredAuthority) {
      throw new UnauthorizedException('Unauthorized');
    }

    return true;
  }
}
