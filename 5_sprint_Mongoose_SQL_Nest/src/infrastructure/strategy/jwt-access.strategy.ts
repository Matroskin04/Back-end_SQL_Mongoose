import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersQueryRepository } from '../../features/users/infrastructure/query.repository/users.query.repository';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(protected usersQueryRepository: UsersQueryRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.PRIVATE_KEY_ACCESS_TOKEN,
    });
  }

  async validate(payload: any) {
    const userInfo = this.usersQueryRepository.getUserInfoById(payload.userId);
    if (!userInfo) throw new UnauthorizedException();

    return { id: payload.userId };
  }
}

@Injectable()
export class JwtAccessStrategyMongo extends PassportStrategy(
  Strategy,
  'jwt-access-mongo',
) {
  constructor(protected usersQueryRepository: UsersQueryRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.PRIVATE_KEY_ACCESS_TOKEN,
    });
  }

  async validate(payload: any) {
    const user = this.usersQueryRepository.getUserByUserIdMongo(payload.userId); //todo оставить потом только SQL

    if (!user) throw new UnauthorizedException();

    return { id: payload.userId };
  }
}
