import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';
import { appSettings } from './app.settings';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSettings(app);

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
