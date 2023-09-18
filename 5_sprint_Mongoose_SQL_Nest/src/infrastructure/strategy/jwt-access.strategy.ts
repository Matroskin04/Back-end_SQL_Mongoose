import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersQueryRepository } from '../../features/users/infrastructure/SQL/query.repository/users.query.repository';
import { UsersOrmQueryRepository } from '../../features/users/infrastructure/typeORM/query.repository/users-orm.query.repository';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(protected usersOrmQueryRepository: UsersOrmQueryRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.PRIVATE_KEY_ACCESS_TOKEN,
    });
  }

  async validate(payload: any) {
    const userInfo = await this.usersOrmQueryRepository.getUserInfoByIdView(
      payload.userId,
    );
    if (!userInfo) throw new UnauthorizedException();

    return { id: payload.userId };
  }
}
