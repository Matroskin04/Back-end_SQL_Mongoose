import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Device } from '../../domain/devices.entity';
import { DeviceDBType, DeviceModelType } from '../../domain/devices.db.types';
import { DeviceViewType } from './devices.types.query.repository';

@Injectable()
export class DevicesQueryRepository {
  constructor(
    @InjectModel(Device.name)
    private DeviceModel: DeviceModelType,
  ) {}
  async getAllDevicesByUserId(userId: string): Promise<DeviceViewType[]> {
    return this.DeviceModel.find(
      { userId },
      { _id: 0, userId: 0, expirationDate: 0, __v: 0, expireAt: 0 },
    ).lean();
  }

  async getDeviceById(deviceId: string): Promise<DeviceDBType | null> {
    return this.DeviceModel.findOne({ deviceId });
  }
}
