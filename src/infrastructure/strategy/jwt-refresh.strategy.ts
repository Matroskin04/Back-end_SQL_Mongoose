import { Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersQueryRepository } from '../../features/users/infrastructure/SQL/query.repository/users.query.repository';
import { DevicesQueryRepository } from '../../features/devices/infrastructure/SQL/query.repository/devices.query.repository';
import { Request } from 'express';
import { UsersOrmQueryRepository } from '../../features/users/infrastructure/typeORM/query.repository/users-orm.query.repository';
import { DevicesOrmQueryRepository } from '../../features/devices/infrastructure/typeORM/query.repository/devices-orm.query.repository';
@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
    protected devicesOrmQueryRepository: DevicesOrmQueryRepository,
  ) {
    super({
      jwtFromRequest: JwtRefreshStrategy.extractJWT,
      ignoreExpiration: false,
      secretOrKey: process.env.PRIVATE_KEY_REFRESH_TOKEN,
    });
  }

  async validate(payload: any) {
    const user = await this.usersOrmQueryRepository.getUserInfoByIdView(
      payload.userId,
    );
    if (!user) throw new UnauthorizedException();

    const device = await this.devicesOrmQueryRepository.getDeviceById(
      payload.deviceId,
    );

    if (
      device?.userId !== payload.userId ||
      device?.id !== payload.deviceId ||
      device?.lastActiveDate !== new Date(payload.iat! * 1000).toISOString()
    ) {
      throw new UnauthorizedException();
    }

    return { id: payload.userId };
  }

  private static extractJWT(req: Request): string | null {
    if (req.cookies && req.cookies.refreshToken) {
      return req.cookies.refreshToken;
    }
    return null;
  }
}
