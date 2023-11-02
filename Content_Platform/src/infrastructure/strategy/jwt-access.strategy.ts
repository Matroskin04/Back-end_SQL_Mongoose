import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersOrmQueryRepository } from '../../features/users/infrastructure/typeORM/query.repository/users-orm.query.repository';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../configuration/configuration';

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(
  Strategy,
  'jwt-access',
) {
  constructor(
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
    private configService: ConfigService<ConfigType>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt', {
        infer: true,
      })!.PRIVATE_KEY_ACCESS_TOKEN,
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
