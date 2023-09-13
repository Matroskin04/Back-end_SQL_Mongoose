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
    const result = await this.dataSource.query(
      `
    UPDATE public."devices"
      SET "lastActiveDate" = $1
      WHERE "id" = $2`,
      [new Date(iat * 1000).toISOString(), deviceId],
    );
    return result[1] === 1;
  }

  async deleteDeviceById(deviceId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM public."devices"
        WHERE "id" = $1`,
      [deviceId],
    );
    return result[1] === 1;
  }

  async deleteDevicesExcludeCurrent(deviceId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM public."devices" 
        WHERE "id" != $1`,
      [deviceId],
    );
    console.log(result);
    return result[1] > 0;
  }

  async deleteAllDevicesByUserId(userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM public."devices"
        WHERE "userId" = $1 `,
      [userId],
    );
    return result[1] > 0;
  }
}
