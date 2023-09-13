import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsersBanInfo } from '../../../domain/users-ban-info.entity';
import { plainToClass } from 'class-transformer';

Injectable();
export class BanInfoOrmRepository {
  constructor(
    @InjectRepository(UsersBanInfo)
    protected usersBanInfo: Repository<UsersBanInfo>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createBanInfoUser(userId: string): Promise<void> {
    await this.usersBanInfo
      .createQueryBuilder()
      .insert()
      .values({ userId })
      .execute();
    return;
  }
}
