import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { EmailAdapter } from '../../../infrastructure/adapters/email.adapter';
import { emailAdapterMock } from '../mock.providers/auth.mock.providers';
import { appSettings } from '../../../app.settings';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import {
  createCorrectUserTest,
  loginCorrectUserTest,
} from '../../helpers/chains-of-requests.helpers';
import {
  create10BlogsBy3Users,
  getAllBlogsPublicTest,
} from './blogs-public.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { createResponseAllBlogsTest } from '../../blogger/blogs/blogs-blogger.helpers';

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
  let user;
  let accessToken1;
  let accessToken2;
  let accessToken3;
  let blogsIds;

  describe(`/blogs (GET) - get all blogs`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      accessToken1 = result1.accessToken;
      const result2 = await loginCorrectUserTest(httpServer);
      accessToken2 = result2.accessToken;
      const result3 = await loginCorrectUserTest(httpServer);
      accessToken3 = result3.accessToken;
      //create 10 blogs by 3 users
      blogsIds = await create10BlogsBy3Users(httpServer, [
        accessToken1,
        accessToken2,
        accessToken3,
      ]);
    });

    it(`+ (200) should return 10 blogs`, async () => {
      const result = await getAllBlogsPublicTest(httpServer);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseAllBlogsTest(blogsIds.reverse(), false, 10, 1, 1, 10),
      );
    });
  });
});
