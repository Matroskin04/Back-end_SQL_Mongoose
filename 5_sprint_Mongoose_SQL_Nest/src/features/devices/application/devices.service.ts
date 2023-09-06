import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DevicesRepository } from '../infrastructure/repository/devices.repository';
import { JwtAdapter } from '../../../infrastructure/adapters/jwt.adapter';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesService {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected jwtService: JwtAdapter,
    protected deviceRepository: DevicesRepository,
  ) {}

  async deleteDeviceByRefreshToken(refreshToken: string): Promise<boolean> {
    const payloadToken = this.jwtService.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new Error('Refresh is invalid');
    }

    return this.deviceRepository.deleteDeviceById(payloadToken.deviceId);
  }
}
