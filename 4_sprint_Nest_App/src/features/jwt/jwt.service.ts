import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { JwtQueryRepository } from './jwt.query.repository';
import { AccessRefreshTokens } from './jwt.types.service';
import { v4 as uuidv4 } from 'uuid';
import { JwtService as JwtServiceNest } from '@nestjs/jwt';
import { DevicesRepository } from '../devices/infrastructure/repository/devices.repository';

@Injectable()
export class JwtService {
  constructor(
    protected jwtServiceNest: JwtServiceNest,
    protected jwtQueryRepository: JwtQueryRepository,
    protected devicesRepository: DevicesRepository,
  ) {}

  createAccessJwtToken(userId: string): string {
    const accessToken = this.jwtServiceNest.sign(
      { userId: userId.toString() },
      {
        secret: process.env.PRIVATE_KEY_ACCESS_TOKEN!,
        expiresIn: process.env.EXPIRATION_TIME_ACCESS_TOKEN!,
      },
    );
    return accessToken;
  }

  createRefreshJwtToken(userId: string, deviceId: string | null): string {
    const refreshToken = this.jwtServiceNest.sign(
      { userId: userId.toString(), deviceId: deviceId ?? uuidv4() },
      {
        secret: process.env.PRIVATE_KEY_REFRESH_TOKEN!,
        expiresIn: process.env.EXPIRATION_TIME_REFRESH_TOKEN!,
      },
    );
    return refreshToken;
  }

  async changeTokensByRefreshToken(
    userId: ObjectId,
    cookieRefreshToken: string,
  ): Promise<AccessRefreshTokens> {
    const payloadToken =
      this.jwtQueryRepository.getPayloadToken(cookieRefreshToken);
    if (!payloadToken) {
      throw new Error('Refresh token is invalid.');
    }

    const accessToken = this.createAccessJwtToken(userId.toString());
    const refreshToken = this.createRefreshJwtToken(
      userId.toString(),
      payloadToken.deviceId,
    );

    const payloadNewRefresh =
      this.jwtQueryRepository.getPayloadToken(refreshToken);
    if (!payloadNewRefresh?.iat) {
      throw new Error('Refresh token is invalid.');
    }

    const device = await this.devicesRepository.getDeviceInstance(
      payloadToken.deviceId,
    );
    if (!device) throw new Error('DeviceId in refresh token is invalid.');

    device.lastActiveDate = new Date(
      payloadNewRefresh.iat * 1000,
    ).toISOString();

    await this.devicesRepository.save(device);

    return {
      accessToken,
      refreshToken,
    };
  }
}
