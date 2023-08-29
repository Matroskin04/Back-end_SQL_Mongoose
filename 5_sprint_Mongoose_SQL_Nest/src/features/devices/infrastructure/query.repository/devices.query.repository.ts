import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeviceDBType, DeviceModelType } from '../../domain/devices.db.types';
import { DeviceViewType } from './devices.types.query.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  //SQL
  async getDeviceById(deviceId: string): Promise<any | null> {
    //todo type
    const result = await this.dataSource.query(
      `
    SELECT "id", "ip", "title", "lastActiveDate", "userId", "expirationDate"
        FROM public."devices"
        WHERE "id" = $1`,
      [deviceId],
    );
    if (result.length === 0) return null;
    return result[0];
  }

  async getAllDevicesByUserId(userId: string): Promise<DeviceViewType[] | []> {
    const result = await this.dataSource.query(
      `
    SELECT "id" as "deviceId", "ip", "title", "lastActiveDate"
        FROM public."devices"
        WHERE "userId" = $1`,
      [userId],
    );
    if (result.length === 0) return [];
    return result;
  }
}
