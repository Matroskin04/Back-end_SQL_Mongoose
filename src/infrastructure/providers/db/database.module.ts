import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfig } from './type-orm.config';
import { configModule } from '../../../configuration/configModule';
import { Module } from '@nestjs/common';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [configModule],
      useClass: TypeOrmConfig,
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
