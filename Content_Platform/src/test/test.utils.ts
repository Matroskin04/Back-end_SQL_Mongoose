import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../app.module';
import { EmailAdapter } from '../infrastructure/adapters/email.adapter';
import { emailAdapterMock } from './public/mock.providers/auth.mock.providers';
import { appSettings } from '../app.settings';
import { INestApplication } from '@nestjs/common';

export async function startApp() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(EmailAdapter)
    .useValue(emailAdapterMock)
    .compile();

  const app: INestApplication = moduleFixture.createNestApplication();
  appSettings(app); //activate settings for app
  await app.init();

  const httpServer = app.getHttpServer();
  return {
    app,
    httpServer,
  };
}
