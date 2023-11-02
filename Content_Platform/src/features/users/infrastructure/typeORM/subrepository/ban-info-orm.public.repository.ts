import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsersBanInfo } from '../../../domain/users-ban-info.entity';

Injectable();
export class BanInfoOrmRepository {
  constructor(
    @InjectRepository(UsersBanInfo)
    protected usersBanInfo: Repository<UsersBanInfo>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createBanInfoUser(
    userId: string,
    usersBanInfoRepo: Repository<UsersBanInfo> = this.usersBanInfo,
  ): Promise<void> {
    await usersBanInfoRepo
      .createQueryBuilder()
      .insert()
      .values({ userId })
      .execute();
    return;
  }
}
