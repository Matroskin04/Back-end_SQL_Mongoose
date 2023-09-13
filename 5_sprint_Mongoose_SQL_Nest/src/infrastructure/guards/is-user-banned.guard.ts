import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersQueryRepository } from '../../features/users/infrastructure/SQL/query.repository/users.query.repository';
import { JwtAdapter } from '../adapters/jwt.adapter';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class IsUserBannedByLoginOrEmailGuard implements CanActivate {
  constructor(protected usersQueryRepository: UsersQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.body || !request.body.loginOrEmail)
      throw new Error('Login must be passed');

    const user = await this.usersQueryRepository.getUserBanInfoByLoginOrEmail(
      request.body.loginOrEmail,
    );
    if (!user) throw new UnauthorizedException('User is not found');
    if (user.isBanned) throw new UnauthorizedException('User is banned'); //If user is banned - then Unauthorized

    return true;
  }
}

@Injectable()
export class IsUserBannedByJWTGuard extends AuthGuard(
  'is-user-banned-by-jwt',
) {}
