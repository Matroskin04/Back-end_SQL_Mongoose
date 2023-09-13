import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { DeviceViewType } from '../../SQL/query.repository/devices.types.query.repository';
import { Users } from '../../../../users/domain/users.entity';
import { Devices } from '../../../domain/devices.entity';

@Injectable()
export class DevicesOrmQueryRepository {
  constructor(
    @InjectRepository(Devices)
    protected devicesRepository: Repository<Devices>,
    @InjectDataSource() protected dataSource: DataSource,
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
