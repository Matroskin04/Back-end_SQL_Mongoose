import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { UsersSaService } from '../../../features/users/super-admin/application/users-sa.service';

@Injectable()
export class JwtAccessNotStrictGuardMongo extends AuthGuard('jwt') {
  constructor(protected usersService: UsersSaService) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!accessToken) return true;

    const user = await this.usersService.getUserIdByAccessTokenMongo(
      accessToken,
    );
    if (!user) throw new UnauthorizedException();

    request.userId = user._id;
    return true;
  }
}

@Injectable()
export class JwtAccessNotStrictGuard extends AuthGuard('jwt') {
  constructor(protected usersService: UsersSaService) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!accessToken) return true;

    const userId = await this.usersService.getUserIdByAccessToken(accessToken);
    if (!userId) throw new UnauthorizedException();
    request.userId = userId;
    return true;
  }
}
