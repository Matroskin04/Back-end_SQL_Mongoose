import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class TestingRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}
  async deleteAllData(): Promise<void> {
    try {
      await this.dataSource.query(`
      TRUNCATE public."users" CASCADE;
      TRUNCATE public."questions_quiz" CASCADE;`);
    } catch (err) {
      console.log(`The error has occurred: ${err}`);
    }
  }
}
