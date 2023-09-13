import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsersEmailConfirmation } from '../../../domain/users-email-confirmation.entity';
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
    const result = await this.dataSource.query(
      `
    UPDATE public."users_password_recovery"
      SET "confirmationCode" = $1, "expirationDate" = now() + ('3 hour'::interval) 
      WHERE "userId" = $2`,
      [newCode, userId],
    );
    return result[1] === 1;
  }
}
