import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

Injectable();
export class BanInfoPublicRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createBanInfoUser(userId: string): Promise<void> {
    await this.dataSource.query(
      `
    INSERT INTO public.users_ban_info(
        "userId")
         VALUES ($1);`,
      [userId],
    );
    return;
  }
}
