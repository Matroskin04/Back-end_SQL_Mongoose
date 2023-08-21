import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersSAQueryRepository } from '../../features/users/super-admin/infrastructure/query.repository/users-sa.query.repository';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(protected usersQueryRepository: UsersSAQueryRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.PRIVATE_KEY_ACCESS_TOKEN,
    });
  }

  async validate(payload: any) {
    const user = this.usersQueryRepository.getUserByUserId(payload.userId);
    if (!user) throw new UnauthorizedException();

    return { id: payload.userId };
  }
}
