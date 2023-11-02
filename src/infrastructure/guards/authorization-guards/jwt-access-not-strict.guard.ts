import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { JwtAdapter } from '../../adapters/jwt.adapter';
@Injectable()
export class JwtAccessNotStrictGuard extends AuthGuard('jwt') {
  constructor(protected jwtAdapter: JwtAdapter) {
    super();
  }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(request);

    if (!accessToken) return true;

    const userId = await this.jwtAdapter.getUserIdByAccessToken(accessToken);
    if (!userId) return true;
    request.userId = userId;
    return true;
  }
}
