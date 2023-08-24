import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { appSettings } from './app.settings';
import pg from 'pg';

const { Pool } = pg;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSettings(app);

  await app.listen(process.env.PORT || 5000);
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL + '?sslmode=require',
  });
}
bootstrap();
