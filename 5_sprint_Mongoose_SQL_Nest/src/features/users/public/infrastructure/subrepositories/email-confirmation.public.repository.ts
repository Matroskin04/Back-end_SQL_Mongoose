import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class EmailConfirmationPublicRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createEmailConfirmationInfo(
    confirmationCode: string,
    expirationDate: Date,
    isConfirmed: boolean,
    userId: string,
  ) {
    const result = await this.dataSource.query(
      `
    INSERT INTO public.users_email_confirmation( 
        "confirmationCode", "expirationDate", "isConfirmed", "userId") 
        VALUES ($1, $2, $3, $4);
    `,
      [confirmationCode, expirationDate, isConfirmed, userId],
    );
    return result;
  }
}
