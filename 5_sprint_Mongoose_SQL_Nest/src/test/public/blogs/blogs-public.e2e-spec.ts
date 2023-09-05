import { INestApplication } from '@nestjs/common';
import { Connection } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { v4 as uuidv4 } from 'uuid';
import { EmailAdapter } from '../../../infrastructure/adapters/email.adapter';
import { emailAdapterMock } from '../mock.providers/auth.mock.providers';
import { appSettings } from '../../../app.settings';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import {
  createCorrectBlogTest,
  createCorrectUserTest,
  loginCorrectUserTest,
} from '../../helpers/chains-of-requests.helpers';
import {
  create9BlogsBy3Users,
  createAndLogin3UsersTest,
  getAllBlogsPublicTest,
  getBlogByIdPublicTest,
} from './blogs-public.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import {
  createResponseAllBlogsTest,
  createResponseSingleBlog,
} from '../../blogger/blogs/blogs-blogger.helpers';
import {
  createResponseAllPostsTest,
  getPostsOfBlogPublicTest,
} from './posts-blogs-puclic.helpers';
import { createUserTest } from '../../super-admin/users-sa.helpers';
import { loginUserTest } from '../auth/auth-public.helpers';

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

  let correctBlogId;
  const correctBlogName = 'correctName';
  const correctDescription = 'correctDescription';
  const correctWebsiteUrl =
    'https://SoBqgeyargbRK5jx76KYc6XS3qU9LWMJCvbDif9VXOiplGf4-RK0nhw34lvql.zgG73ki0po16f.J4U96ZRvoH3VE_WK';

  describe(`/blogs (GET) - get all blogs`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login 3 users
      const result = await createAndLogin3UsersTest(httpServer);
      accessToken1 = result[0].accessToken;
      accessToken2 = result[1].accessToken;
      accessToken3 = result[2].accessToken;
      //create 9 blogs by 3 users
      blogsIds = await create9BlogsBy3Users(httpServer, [
        accessToken1,
        accessToken2,
        accessToken3,
      ]);
    });

    it(`+ (200) should return 10 blogs`, async () => {
      const result = await getAllBlogsPublicTest(httpServer);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseAllBlogsTest(blogsIds.reverse(), false, 9, 1, 1, 10),
      );
    });
  });

  describe(`/blogs/:id (GET) - get blog by id`, () => {
    let blog;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      accessToken1 = result1.accessToken;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
    });

    it(`- (404) should not find blog by id`, async () => {
      const result = await getBlogByIdPublicTest(httpServer, uuidv4());
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (200) should return blog by id`, async () => {
      const result = await getBlogByIdPublicTest(httpServer, blog.id);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseSingleBlog(
          blog.id,
          blog.name,
          blog.description,
          blog.websiteUrl,
        ),
      );
    });
  });

  describe(`/blogs/:id/posts (GET) - get posts of blog`, () => {
    let blog;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      accessToken1 = result1.accessToken;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
    });

    it(`- (404) should not return posts because of blog with such id doesn't exist`, async () => {
      const result = await getPostsOfBlogPublicTest(httpServer, uuidv4());
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (200) should return blog by id`, async () => {
      const result = await getPostsOfBlogPublicTest(httpServer, blog.id);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(createResponseAllPostsTest([]));
    });
  });
});
