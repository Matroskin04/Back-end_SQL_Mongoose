import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { EmailAdapter } from '../../../infrastructure/adapters/email.adapter';
import { emailAdapterMock } from '../mock.providers/auth.mock.providers';
import { appSettings } from '../../../app.settings';

describe('Blogs (Public); /', () => {
  jest.setTimeout(5 * 60 * 1000);
  //vars for starting app and testing
  let app: INestApplication;
  let httpServer;
  let dbConnection: Connection;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailAdapter)
      .useValue(emailAdapterMock)
      .compile();
    dbConnection = moduleFixture.get<Connection>(Connection);

    app = moduleFixture.createNestApplication();
    appSettings(app); //activate settings for app
    await app.init();

    httpServer = app.getHttpServer();
  });

  afterAll(async () => {
    await httpServer.close();
    await app.close();
  });
});
