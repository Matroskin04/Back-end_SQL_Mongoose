import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import process from 'process';
import { appSettings } from './app.settings';
import ngrok from 'ngrok';
import { TelegramAdapter } from './infrastructure/adapters/telegram.adapter';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './configuration/configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appSettings(app);
  const configService: ConfigService<ConfigType> = await app.resolve(
    ConfigService,
  );
  const telegramAdapter = await app.resolve(TelegramAdapter);
  let baseUrl = configService.get('app', { infer: true })!.CURRENT_APP_BASE_URL;
  if (configService.get('app', { infer: true })!.NODE_ENV === 'development') {
    baseUrl = await ngrok.connect(Number(process.env.PORT) || 5000);
    console.log('Ngrok BaseURL:', baseUrl);
  }
  // await telegramAdapter.sendWebhook(baseUrl);

  await app.listen(process.env.PORT || 5000);
}
bootstrap();
