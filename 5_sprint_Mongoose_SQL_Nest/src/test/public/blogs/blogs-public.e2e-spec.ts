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
import { createErrorsMessageTest } from '../../helpers/errors-message.helper';
import {
  create9PostsOf3BlogsBy3Users,
  create9PostsOfBlog,
} from '../posts/posts-public.helpers';

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

  let correctBlogId;
  const correctBlogName = 'correctName';
  const correctDescription = 'correctDescription';
  const correctWebsiteUrl =
    'https://SoBqgeyargbRK5jx76KYc6XS3qU9LWMJCvbDif9VXOiplGf4-RK0nhw34lvql.zgG73ki0po16f.J4U96ZRvoH3VE_WK';

  describe(`/blogs (GET) - get all blogs`, () => {
    let blogsIds;
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

    it(`+ (200) should return 9 blogs`, async () => {
      const result = await getAllBlogsPublicTest(httpServer);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseAllBlogsTest(blogsIds, null, 9, 1, 1, 10),
      );
    });

    it(`+ (200) should return 0 blogs (no blogs with such name term) `, async () => {
      const result = await getAllBlogsPublicTest(
        httpServer,
        'searchNameTerm=qwertyuio1234568',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseAllBlogsTest([], null, 0, 1, 1, 10),
      );
    });

    it(`+ (200) should return 3 blogs (query: pageSize=3, pageNumber=2)
              + (200) should return 4 blogs (query: pageSize=5, pageNumber=2)`, async () => {
      //3 blogs
      const result1 = await getAllBlogsPublicTest(
        httpServer,
        'pageSize=3&&pageNumber=2',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllBlogsTest(blogsIds.slice(3, 6), null, 9, 3, 2, 3),
      );

      //4 blogs
      const result2 = await getAllBlogsPublicTest(
        httpServer,
        'pageSize=5&&pageNumber=2',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllBlogsTest(blogsIds.slice(5), null, 9, 2, 2, 5),
      );
    });

    it(`+ (200) should return 9 blogs (query: sortBy=name&&pageSize=5)
              + (200) should return 9 blogs (query: sortDirection=asc)
              + (200) should return 9 blogs (query: sortBy=id&&sortDirection=desc)`, async () => {
      const blogsIdsCopy = [...blogsIds];
      //sortBy=name, 9 blogs
      const result1 = await getAllBlogsPublicTest(
        httpServer,
        'sortBy=name&&pageSize=5',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllBlogsTest(blogsIdsCopy.slice(0, 5), null, 9, 2, 1, 5),
      );

      //sortDirection=asc, 9 blogs
      const result2 = await getAllBlogsPublicTest(
        httpServer,
        'sortDirection=asc',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllBlogsTest(blogsIdsCopy.reverse(), null, 9, 1, 1, 10),
      );

      //sortBy=id&&sortDirection=desc, 9 blogs
      const result3 = await getAllBlogsPublicTest(
        httpServer,
        'sortBy=id&&sortDirection=desc',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        createResponseAllBlogsTest(
          blogsIdsCopy.sort().reverse(),
          null,
          9,
          1,
          1,
          10,
        ),
      );
    });

    it(`+ (200) should return 1 blog (query: searchNameTerm=irs)
              + (200) should return 7 blogs (query: searchNameTerm=TH)
              + (200) should return 4 blogs (query: searchNameTerm=S)`, async () => {
      //searchNameTerm=irs, 1 blogs
      const result1 = await getAllBlogsPublicTest(
        httpServer,
        'searchNameTerm=irs',
      );
      console.log(blogsIds[8]);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllBlogsTest([blogsIds[8]], null, 1, 1, 1, 10),
      );

      //searchNameTerm=TH, 7 blogs
      const result2 = await getAllBlogsPublicTest(
        httpServer,
        'searchNameTerm=TH',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllBlogsTest(blogsIds.slice(0, 7), null, 7, 1, 1, 10),
      );

      //searchNameTerm=S, 4 blogs
      const result3 = await getAllBlogsPublicTest(
        httpServer,
        'searchNameTerm=S',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        createResponseAllBlogsTest(
          blogsIds.filter((e, i) => i === 2 || i === 3 || i === 7 || i === 8),
          null,
          4,
          1,
          1,
          10,
        ),
      );
    });

    it(`- (400) sortBy has incorrect value (query: sortBy=Truncate;)
              - (400) sortDirection has incorrect value (query: sortDirection=Truncate;)`, async () => {
      //status 400
      const result1 = await getAllBlogsPublicTest(
        httpServer,
        'sortBy=Truncate;',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['sortBy']));

      //status 400
      const result2 = await getAllBlogsPublicTest(
        httpServer,
        'sortDirection=Truncate;',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['sortDirection']));
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
    let postsIds;
    let blog;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      accessToken1 = result1.accessToken;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
      //create 9 posts of 3 blogs by 3 users
      postsIds = await create9PostsOfBlog(httpServer, blog.id, accessToken1);
    });

    it(`- (404) should not return posts because of blog with such id doesn't exist`, async () => {
      const result = await getPostsOfBlogPublicTest(httpServer, uuidv4());
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (200) should return 9 posts of blog by id`, async () => {
      const result = await getPostsOfBlogPublicTest(httpServer, blog.id);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseAllPostsTest(postsIds, null, null, null, 9, 1, 1, 10),
      );
    });

    it(`+ (200) should return 3 posts (query: pageSize=3, pageNumber=2)
              + (200) should return 4 posts (query: pageSize=5, pageNumber=2)`, async () => {
      //3 posts
      const result1 = await getPostsOfBlogPublicTest(
        httpServer,
        blog.id,
        accessToken1,
        'pageSize=3&&pageNumber=2',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllPostsTest(
          postsIds.slice(3, 6),
          null,
          null,
          null,
          9,
          3,
          2,
          3,
        ),
      );

      //4 posts
      const result2 = await getPostsOfBlogPublicTest(
        httpServer,
        blog.id,
        accessToken1,
        'pageSize=5&&pageNumber=2',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllPostsTest(
          postsIds.slice(5),
          null,
          null,
          null,
          9,
          2,
          2,
          5,
        ),
      );
    });

    it(`+ (200) should return 9 posts (query: sortBy=title&&pageSize=5)
              + (200) should return 9 posts (query: sortBy=content&&pageSize=5)
              + (200) should return 9 posts (query: sortBy=shortDescription&&pageSize=5)
              + (200) should return 9 posts (query: sortDirection=asc)
              + (200) should return 9 posts (query: sortBy=id&&sortDirection=desc)`, async () => {
      const postsIdsCopy = [...postsIds];
      //sortBy=name, total 9 posts
      const result1 = await getPostsOfBlogPublicTest(
        httpServer,
        blog.id,
        accessToken1,
        'sortBy=title&&pageSize=5',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllPostsTest(
          postsIdsCopy.slice(0, 5),
          null,
          null,
          null,
          9,
          2,
          1,
          5,
        ),
      );

      //sortBy=content, total 9 posts
      const result2 = await getPostsOfBlogPublicTest(
        httpServer,
        blog.id,
        accessToken1,
        'sortBy=title&&pageSize=5',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllPostsTest(
          postsIdsCopy.slice(0, 5),
          null,
          null,
          null,
          9,
          2,
          1,
          5,
        ),
      );

      //sortBy=shortDescription, total 9 posts
      const result3 = await getPostsOfBlogPublicTest(
        httpServer,
        blog.id,
        accessToken1,
        'sortBy=title&&pageSize=5',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        createResponseAllPostsTest(
          postsIdsCopy.slice(0, 5),
          null,
          null,
          null,
          9,
          2,
          1,
          5,
        ),
      );

      //sortDirection=asc, total 9 posts
      const result4 = await getPostsOfBlogPublicTest(
        httpServer,
        blog.id,
        accessToken1,
        'sortDirection=asc',
      );
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result4.body).toEqual(
        createResponseAllPostsTest(
          postsIdsCopy.reverse(),
          null,
          null,
          null,
          9,
          1,
          1,
          10,
        ),
      );

      //sortBy=id&&sortDirection=desc, total 9 blogs
      const result5 = await getPostsOfBlogPublicTest(
        httpServer,
        blog.id,
        accessToken1,
        'sortBy=id&&sortDirection=desc',
      );
      expect(result5.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result5.body).toEqual(
        createResponseAllPostsTest(
          postsIdsCopy.sort().reverse(),
          null,
          null,
          null,
          9,
          1,
          1,
          10,
        ),
      );
    });

    it(`- (400) sortBy has incorrect value (query: sortBy=Truncate;)
              - (400) sortDirection has incorrect value (query: sortDirection=Truncate;)`, async () => {
      //status 400
      const result1 = await getPostsOfBlogPublicTest(
        httpServer,
        blog.id,
        accessToken1,
        'sortBy=Truncate;',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['sortBy']));

      //status 400
      const result2 = await getPostsOfBlogPublicTest(
        httpServer,
        blog.id,
        accessToken1,
        'sortDirection=Truncate;',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['sortDirection']));
    });
  });
});
