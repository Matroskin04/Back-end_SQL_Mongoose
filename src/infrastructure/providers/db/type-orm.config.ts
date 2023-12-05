import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { ConfigType } from '../../../configuration/configuration';

@Injectable()
export class TypeOrmConfig implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService<ConfigType>) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const nodeEnv = this.configService.get('app').NODE_ENV;
    if (nodeEnv.toLowerCase() === 'production') {
      return this.getRemoteDbOptions();
    }
    return this.getLocalDbOptions();
  }

  private getLocalDbOptions(): TypeOrmModuleOptions {
    const dbConfig = this.configService.get('db', {
      infer: true,
    })!.postgresqlLocal;
    console.log(dbConfig);
    return {
      type: 'postgres',
      host: dbConfig.POSTGRES_HOST,
      port: 5432,
      username: dbConfig.POSTGRES_USER,
      password: dbConfig.POSTGRES_PASSWORD,
      database: dbConfig.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
      // ssl: { require: true, rejectUnauthorized: false },
      // url: process.env.POSTGRES_URL + '?sslmode=require',
    };
  }

  private getRemoteDbOptions(): TypeOrmModuleOptions {
    const dbConfig = this.configService.get('db', {
      infer: true,
    })!.postgresqlRemote;
    return {
      type: 'postgres',
      host: dbConfig.POSTGRES_HOST,
      port: 5432,
      username: dbConfig.POSTGRES_USER,
      password: dbConfig.POSTGRES_PASSWORD,
      database: dbConfig.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: false,
      ssl: true,
      // url: process.env.POSTGRES_URL + '?sslmode=require',
    };
  }
}
