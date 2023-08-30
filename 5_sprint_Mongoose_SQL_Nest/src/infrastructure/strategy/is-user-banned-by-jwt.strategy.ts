import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersQueryRepository } from '../../features/users/infrastructure/query.repository/users.query.repository';

//todo duplicate logic from jwt strategy
@Injectable()
export class IsUserBannedByJWTStrategy extends PassportStrategy(
  Strategy,
  'is-user-banned-by-jwt',
) {
  constructor(protected usersQueryRepository: UsersQueryRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.PRIVATE_KEY_ACCESS_TOKEN,
    });
  }

  async validate(payload: any) {
    const userInfo = await this.usersQueryRepository.getUserWithBanInfoById(
      payload.userId,
    );
    if (!userInfo) throw new UnauthorizedException();
    if (userInfo.isBanned)
      throw new ForbiddenException("You can't do this, because you are baned");
  }
}
