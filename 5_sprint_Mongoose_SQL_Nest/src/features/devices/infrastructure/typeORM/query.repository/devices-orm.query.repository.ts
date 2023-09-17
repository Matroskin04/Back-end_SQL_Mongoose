import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  DeviceDBType,
  DeviceViewType,
} from '../../SQL/query.repository/devices.types.query.repository';
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
  async getDeviceById(deviceId: string): Promise<DeviceDBType | null> {
    const result = await this.devicesRepository
      .createQueryBuilder('d')
      .select([
        'd.id',
        'd.ip',
        'd.title',
        'd.lastActiveDate',
        'd.userId',
        'd.expirationDate',
      ])
      .where('d.id = :deviceId', { deviceId })
      .getOne();

    return result;
  }

  async getAllDevicesByUserId(userId: string): Promise<DeviceViewType[] | []> {
    const result = await this.devicesRepository
      .createQueryBuilder('d')
      .select([
        'd.id AS "deviceId"',
        'd.ip AS ip',
        'd.title AS title',
        'd.lastActiveDate AS lastActiveDate',
      ])
      .where('d.userId = :userId', { userId })
      .getRawMany();

    if (result.length === 0) return [];
    return result;
  }
}
