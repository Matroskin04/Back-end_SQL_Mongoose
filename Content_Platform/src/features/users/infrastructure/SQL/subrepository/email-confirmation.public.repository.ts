import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class EmailConfirmationPublicRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createEmailConfirmationInfo(
    confirmationCode: string,
    intervalForExpirationDate: string,
    isConfirmed: boolean,
    userId: string,
  ) {
    const result = await this.dataSource.query(
      `
    INSERT INTO public.users_email_confirmation( 
        "confirmationCode", "expirationDate", "isConfirmed", "userId") 
        VALUES ($1, now() + ($2::interval), $3, $4);
    `,
      [confirmationCode, intervalForExpirationDate ?? '0', isConfirmed, userId],
    );
    return result;
  }

  async updateEmailConfirmationStatus(userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE public."users_email_confirmation"
        SET "isConfirmed" = true
        WHERE "userId" = $1;`,
      [userId],
    );
    return result[1] === 1;
  }

  async updateConfirmationCode(
    userId: string,
    newCode: string,
    intervalForExpirationDate: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE public.users_email_confirmation 
        SET "confirmationCode" = $1, "expirationDate" = now() + ($2::interval)
        WHERE "userId" = $3
    `,
      [newCode, intervalForExpirationDate ?? '0', userId],
    );
    return result[1] === 1;
  }
}
