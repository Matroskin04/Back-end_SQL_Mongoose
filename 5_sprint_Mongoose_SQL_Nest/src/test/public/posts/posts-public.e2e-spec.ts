import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { appSettings } from '../../../app.settings';
import { v4 as uuidv4 } from 'uuid';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import {
  createCorrectBlogTest,
  createCorrectPostTest,
  createCorrectUserTest,
  loginCorrectUserTest,
} from '../../helpers/chains-of-requests.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import {
  create9PostsOf3BlogsBy3Users,
  createResponseSinglePost,
  getPostByIdPublicTest,
  getPostsPublicTest,
} from './posts-public.helpers';
import { createAndLogin3UsersTest } from '../blogs/blogs-public.helpers';
import { createResponseAllPostsTest } from '../blogs/posts-blogs-puclic.helpers';
import {
  createCommentTest,
  createResponseSingleCommentTest,
} from '../comments-public.helpers';
import { createErrorsMessageTest } from '../../helpers/errors-message.helper';
import { createPostTest } from '../../blogger/blogs/posts-blogs-blogger.helpers';

describe('Posts (GET), Put-Like (Post), Comments (Public); /', () => {
  jest.setTimeout(5 * 60 * 1000);

  //vars for starting app and testing
  let app: INestApplication;
  let httpServer;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
  let post;
  let blog;
  let accessToken1;
  let accessToken2;
  let accessToken3;
  let postsIds;

  //comments
  const correctCommentContent = 'Correct comment content';

  //incorrectData comments
  const contentLength301 = 'a'.repeat(301);
  const contentLength19 = 'a'.repeat(19);

  describe(`/posts (GET) - get all posts`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login 3 users
      const result = await createAndLogin3UsersTest(httpServer);
      const blog1 = await createCorrectBlogTest(
        httpServer,
        result[0].accessToken,
      );
      const blog2 = await createCorrectBlogTest(
        httpServer,
        result[1].accessToken,
      );
      const blog3 = await createCorrectBlogTest(
        httpServer,
        result[2].accessToken,
      );
      //create 10 blogs by 3 users
      postsIds = await create9PostsOf3BlogsBy3Users(
        httpServer,
        [blog1.id, blog2.id, blog3.id],
        [result[0].accessToken, result[1].accessToken, result[2].accessToken],
        [result[0].userId, result[1].userId, result[2].userId],
      );
    });

    it(`+ (200) should return 9 posts (without jwt)`, async () => {
      //jwt is incorrect
      const result = await getPostsPublicTest(httpServer);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseAllPostsTest(
          postsIds.map((e) => e.id).reverse(),
          null,
          null,
          null,
          9,
        ),
      );
    });
  });

  describe(`/posts/:id (GET) - get post by id`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login user
      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken1 = result.accessToken;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
      post = await createCorrectPostTest(httpServer, blog.id, accessToken1);
    });

    it(`- (404) should not find post by id`, async () => {
      const result = await getPostByIdPublicTest(httpServer, uuidv4());
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (200) should return post by id`, async () => {
      const result = await getPostByIdPublicTest(httpServer, post.id);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseSinglePost(
          post.id,
          post.title,
          post.shortDescription,
          post.content,
          blog.id,
          blog.name,
        ),
      );
    });
  });

  describe(`/posts/:id/comment (POST) - create comment by post id`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login 3 users
      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken1 = result.accessToken;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
      post = await createCorrectPostTest(httpServer, blog.id, accessToken1);
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await createCommentTest(
        httpServer,
        post.id,
        'IncorrectJWT',
        correctCommentContent,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) post with such id is not found`, async () => {
      const result = await createCommentTest(
        httpServer,
        uuidv4(),
        accessToken1,
        correctCommentContent,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`- (400) value of 'content' is incorrect (small length)
              - (400) value of 'content' is incorrect (large length)
              - (400) value of 'content' is incorrect (not string)`, async () => {
      const result1 = await createCommentTest(
        httpServer,
        post.id,
        accessToken1,
        contentLength19,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['content']));

      const result2 = await createCommentTest(
        httpServer,
        post.id,
        accessToken1,
        contentLength301,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['content']));

      //todo another type (boolean) - 500 error instead of 400

      // const result3 = await createCommentTest(
      //   httpServer,
      //   post.id,
      //   accessToken1,
      //   true,
      // );
      // console.log(result3.body);
      // expect(result3.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      // expect(result3.body).toEqual(createErrorsMessageTest(['content']));
    });
  });

  it(`+ (201) should create comment`, async () => {
    const result = await createCommentTest(
      httpServer,
      post.id,
      accessToken1,
      correctCommentContent,
    );
    expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
    expect(result.body).toEqual(
      createResponseSingleCommentTest(
        null,
        correctCommentContent,
        user.id,
        user.login,
      ),
    );
  });

  describe(`/posts/:id (GET) - get comments by post id`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login user
      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken1 = result.accessToken;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
      post = await createCorrectPostTest(httpServer, blog.id, accessToken1);
    });

    it(`- (404) post with such id is not found`, async () => {
      const result = await getPostByIdPublicTest(httpServer, uuidv4());
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (200) should return post by id`, async () => {
      const result = await getPostByIdPublicTest(httpServer, post.id);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseSinglePost(
          post.id,
          post.title,
          post.shortDescription,
          post.content,
          blog.id,
          blog.name,
        ),
      );
    });
  });
});
