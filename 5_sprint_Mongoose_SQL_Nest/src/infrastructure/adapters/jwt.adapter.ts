import { Injectable } from '@nestjs/common';
import { AccessRefreshTokens } from './types/jwt.types.adapter';
import { v4 as uuidv4 } from 'uuid';
import { JwtService as JwtServiceNest } from '@nestjs/jwt';
import { DevicesRepository } from '../../features/devices/infrastructure/SQL/repository/devices.repository';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { DevicesOrmRepository } from '../../features/devices/infrastructure/typeORM/repository/devices-orm.repository';

@Injectable()
export class JwtAdapter {
  constructor(
    protected jwtServiceNest: JwtServiceNest,
    protected devicesOrmRepository: DevicesOrmRepository,
  ) {}

  createAccessJwtToken(userId: string): string {
    const accessToken = this.jwtServiceNest.sign(
      { userId: userId },
      {
        secret: process.env.PRIVATE_KEY_ACCESS_TOKEN!,
        expiresIn: process.env.EXPIRATION_TIME_ACCESS_TOKEN!,
      },
    );
    return accessToken;
  }

  createRefreshJwtToken(userId: string, deviceId: string | null): string {
    const refreshToken = this.jwtServiceNest.sign(
      { userId: userId, deviceId: deviceId ?? uuidv4() },
      {
        secret: process.env.PRIVATE_KEY_REFRESH_TOKEN!,
        expiresIn: process.env.EXPIRATION_TIME_REFRESH_TOKEN!,
      },
    );
    return refreshToken;
  }

  getPayloadToken(refreshToken: string): JwtPayload | null {
    try {
      return this.jwtServiceNest.verify(refreshToken, {
        secret: process.env.PRIVATE_KEY_REFRESH_TOKEN!,
      });
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getUserIdByAccessToken(token: string): Promise<null | string> {
    try {
      const decode = jwt.verify(
        token,
        process.env.PRIVATE_KEY_ACCESS_TOKEN!,
      ) as {
        userId: string;
      };
      return decode.userId;
    } catch (err) {
      return null;
    }
  }

  async changeTokensByRefreshToken(
    userId: string,
    cookieRefreshToken: string,
  ): Promise<AccessRefreshTokens> {
    const payloadToken = this.getPayloadToken(cookieRefreshToken);
    if (!payloadToken) {
      throw new Error('Refresh token is invalid.');
    }

    const accessToken = this.createAccessJwtToken(userId);
    const refreshToken = this.createRefreshJwtToken(
      userId,
      payloadToken.deviceId,
    );

    const payloadNewRefresh = this.getPayloadToken(refreshToken);
    if (!payloadNewRefresh?.iat) {
      throw new Error('Refresh token is invalid.');
    }

    const device =
      await this.devicesOrmRepository.updateLastActiveDateByDeviceId(
        payloadToken.deviceId,
        payloadNewRefresh.iat,
      );
    if (!device) throw new Error('DeviceId in refresh token is invalid.');

    return {
      accessToken,
      refreshToken,
    };
  }
}
