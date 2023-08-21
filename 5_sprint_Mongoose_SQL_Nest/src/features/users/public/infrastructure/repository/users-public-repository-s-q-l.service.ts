import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersPublicRepositorySQL {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createUser(userInfo): Promise<void> {}
}
