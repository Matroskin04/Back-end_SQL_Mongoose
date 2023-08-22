import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device } from '../../domain/devices.entity';
import { DeviceDBType, DeviceModelType } from '../../domain/devices.db.types';
import { DeviceViewType } from './devices.types.query.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Device.name)
    private DeviceModel: DeviceModelType,
  ) {}

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

  //MONGO
  async getAllDevicesByUserId(userId: string): Promise<DeviceViewType[]> {
    return this.DeviceModel.find(
      { userId },
      { _id: 0, userId: 0, expirationDate: 0, __v: 0, expireAt: 0 },
    ).lean();
  }

  async getDeviceByIdMongo(deviceId: string): Promise<DeviceDBType | null> {
    return this.DeviceModel.findOne({ deviceId });
  }
}
