import { ObjectId } from 'mongodb';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DevicesRepository } from '../infrastructure/repository/devices.repository';
import { JwtService } from '../../jwt/jwt.service';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesService {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected jwtService: JwtService,
    protected deviceRepository: DevicesRepository,
  ) {}

  //SQL
  async deleteAllDevicesByUserId(userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM public."devices"
        WHERE "userId" = $1 `,
      [userId],
    );
    return result[1] > 0;
  }

  async createNewDevice(
    ip: string,
    title: string,
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const payloadToken = this.jwtService.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new UnauthorizedException();
    }
    await this.deviceRepository.createDevice(ip, title, payloadToken, userId);

    return;
  }

  async deleteDeviceByRefreshToken(refreshToken: string): Promise<boolean> {
    const payloadToken = this.jwtService.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new Error('Refresh is invalid');
    }

    return this.deviceRepository.deleteDeviceById(payloadToken.deviceId);
  }
}
