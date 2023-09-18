import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersQueryRepository } from '../../features/users/infrastructure/SQL/query.repository/users.query.repository';
import { UsersOrmQueryRepository } from '../../features/users/infrastructure/typeORM/query.repository/users-orm.query.repository';

// todo duplicate logic from jwt strategy
@Injectable()
export class IsUserBannedByJWTStrategy extends PassportStrategy(
  Strategy,
  'is-user-banned-by-jwt',
) {
  constructor(protected usersOrmQueryRepository: UsersOrmQueryRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.PRIVATE_KEY_ACCESS_TOKEN,
    });
  }

  async validate(payload: any) {
    const userInfo = await this.usersOrmQueryRepository.getUserWithBanInfoById(
      payload.userId,
    );
    if (!userInfo) throw new UnauthorizedException();
    if (userInfo.isBanned)
      throw new ForbiddenException("You can't do this, because you are baned");
    return { id: payload.userId };
  }
}
