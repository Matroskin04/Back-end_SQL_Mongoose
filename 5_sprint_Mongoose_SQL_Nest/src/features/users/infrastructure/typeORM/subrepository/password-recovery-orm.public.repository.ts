import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsersPasswordRecovery } from '../../../domain/users-password-recovery.entity';

Injectable();
export class PasswordRecoveryOrmRepository {
  constructor(
    @InjectRepository(UsersPasswordRecovery)
    protected usersPasswordRecovery: Repository<UsersPasswordRecovery>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createPassRecoveryInfo(
    confirmationCode: string,
    userId: string,
  ): Promise<void> {
    await this.usersPasswordRecovery
      .createQueryBuilder()
      .insert()
      .values({
        confirmationCode,
        userId,
      })
      .execute();
    return;
  }

  async updateCodePasswordRecovery(
    userId: string,
    newCode: string,
  ): Promise<boolean> {
    const result = await this.usersPasswordRecovery
      .createQueryBuilder()
      .update()
      .set({
        confirmationCode: newCode,
        expirationDate: () => `NOW() + INTERVAL '3 hours'`,
      })
      .where('userId = :userId', { userId })
      .execute();

    return result.affected === 1;
  }
}
