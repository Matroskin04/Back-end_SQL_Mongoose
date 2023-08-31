import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

Injectable();
export class PasswordRecoveryPublicRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createPassRecoveryInfo(
    confirmationCode: string | null,
    userId: string,
  ): Promise<void> {
    await this.dataSource.query(
      `
    INSERT INTO public.users_password_recovery(
        "confirmationCode", "userId")
        VALUES ( $1, $2);`,
      [confirmationCode, userId],
    );
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
    ); //todo другая дата ставится
    return result[1] === 1;
  }
}
