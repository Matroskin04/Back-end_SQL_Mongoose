import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UsersEmailConfirmation } from '../../../domain/users-email-confirmation.entity';

@Injectable()
export class EmailConfirmationOrmRepository {
  constructor(
    @InjectRepository(UsersEmailConfirmation)
    protected usersEmailConfirmationRepo: Repository<UsersEmailConfirmation>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createEmailConfirmationInfo(
    confirmationCode: string,
    intervalForExpirationDate: string,
    isConfirmed: boolean,
    userId: string,
    usersEmailConfirmationRepo: Repository<UsersEmailConfirmation> = this
      .usersEmailConfirmationRepo,
  ): Promise<void> {
    await usersEmailConfirmationRepo
      .createQueryBuilder()
      .insert()
      .values({
        confirmationCode,
        expirationDate: () =>
          `NOW() + INTERVAL '${intervalForExpirationDate ?? '0'}'`,
        isConfirmed,
        userId,
      })
      .execute();
    return;
  }

  async updateEmailConfirmationStatus(userId: string): Promise<boolean> {
    const result = await this.usersEmailConfirmationRepo
      .createQueryBuilder()
      .update()
      .set({ isConfirmed: true })
      .where('userId = :userId', { userId })
      .execute();

    return result.affected === 1;
  }

  async updateConfirmationCode(
    userId: string,
    newCode: string,
    intervalForExpirationDate: string,
  ): Promise<boolean> {
    const result = await this.usersEmailConfirmationRepo
      .createQueryBuilder()
      .update()
      .set({
        confirmationCode: newCode,
        expirationDate: () =>
          `NOW() + INTERVAL '${intervalForExpirationDate ?? '0'}'`,
      })
      .where('userId = :userId', { userId })
      .execute();

    return result.affected === 1;
  }
}
