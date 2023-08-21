import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersPublicRepositorySQL {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createUser(
    userId: string,
    login: string,
    email: string,
    passwordHash: string,
  ): Promise<void> {
    await this.dataSource.query(
      `
    INSERT INTO public.users( 
        "id", "login", "email", "passwordHash") 
        VALUES ($1, $2, $3, $4);
`,
      [userId, login, email, passwordHash],
    );
    return;
  }
}
