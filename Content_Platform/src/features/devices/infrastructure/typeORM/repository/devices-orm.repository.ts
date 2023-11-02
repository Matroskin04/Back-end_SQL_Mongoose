import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { JwtPayload } from 'jsonwebtoken';
import { Users } from '../../../../users/domain/users.entity';
import { Devices } from '../../../domain/devices.entity';

@Injectable()
export class DevicesOrmRepository {
  constructor(
    @InjectRepository(Devices)
    protected devicesRepository: Repository<Devices>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createDevice(
    ip: string,
    title: string,
    payloadToken: JwtPayload,
    userId: string,
  ): Promise<void> {
    const result = await this.devicesRepository
      .createQueryBuilder()
      .insert()
      .values({
        id: payloadToken.deviceId,
        ip,
        title,
        userId,
        lastActiveDate: new Date(payloadToken.iat! * 1000).toISOString(),
        expirationDate: payloadToken.exp! - payloadToken.iat!,
      })
      .execute();

    return;
  }

  async updateLastActiveDateByDeviceId(
    deviceId: string,
    iat: number,
  ): Promise<boolean> {
    const result = await this.devicesRepository
      .createQueryBuilder()
      .update()
      .set({ lastActiveDate: new Date(iat * 1000).toISOString() })
      .where('id = :deviceId', { deviceId })
      .execute();

    return result.affected === 1;
  }

  async deleteDeviceById(deviceId: string): Promise<boolean> {
    const result = await this.devicesRepository
      .createQueryBuilder()
      .delete()
      .where('id = :deviceId', { deviceId })
      .execute();
    return result.affected === 1;
  }

  async deleteDevicesExcludeCurrent(deviceId: string): Promise<boolean> {
    const result = await this.devicesRepository
      .createQueryBuilder()
      .delete()
      .where('id != :deviceId', { deviceId })
      .execute();

    return result.affected ? result.affected > 0 : false;
  }

  async deleteAllDevicesByUserId(
    userId: string,
    devicesRepository: Repository<Devices> = this.devicesRepository,
  ): Promise<boolean> {
    const result = await devicesRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .execute();

    return result.affected ? result.affected > 0 : false;
  }
}
