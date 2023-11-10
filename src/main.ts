import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import process from 'process';
import { appSettings } from './app.settings';
import ngrok from 'ngrok';
import { TelegramAdapter } from './infrastructure/adapters/telegram.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSettings(app);

  const telegramAdapter = await app.resolve(TelegramAdapter);
  const baseUrl = await ngrok.connect(Number(process.env.PORT) || 5000);
  await telegramAdapter.setWebhook(baseUrl);

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
