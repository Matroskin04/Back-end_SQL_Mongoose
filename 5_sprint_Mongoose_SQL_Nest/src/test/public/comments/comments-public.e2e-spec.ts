import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../../app.module';
import { appSettings } from '../../../app.settings';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import { v4 as uuidv4 } from 'uuid';
import {
  createCorrectBlogTest,
  createCorrectPostTest,
  createCorrectUserTest,
  loginCorrectUserTest,
} from '../../helpers/chains-of-requests.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import {
  createCorrectCommentTest,
  createResponseSingleComment,
  deleteCommentTest,
  getCommentTest,
} from './comments-public.helpers';
import { deletePostTest } from '../../blogger/blogs/posts-blogs-blogger.helpers';
import { createUserTest } from '../../super-admin/users-sa.helpers';
import { loginUserTest } from '../auth/auth-public.helpers';
import { getPostByIdPublicTest } from '../posts/posts-public.helpers';

describe('Comments, Put-like comment, (Public); /', () => {
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
  let comment;
  let accessToken1;
  let accessToken2;
  let accessToken3;
  let postsIds;
  let commentsIds;

  //comments
  const correctCommentContent = 'Correct comment content';

  //incorrectData comments
  const contentLength301 = 'a'.repeat(301);
  const contentLength19 = 'a'.repeat(19);

  describe(`/comments/:id (GET) - get comment by id`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login user
      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken1 = result.accessToken;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
      post = await createCorrectPostTest(httpServer, blog.id, accessToken1);
      comment = await createCorrectCommentTest(
        httpServer,
        post.id,
        accessToken1,
      );
    });

    it(`- (404) should not find comment by id`, async () => {
      const result = await getCommentTest(httpServer, uuidv4());
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (200) should return comment by id (without jwt)`, async () => {
      const result = await getCommentTest(httpServer, comment.id);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseSingleComment(
          comment.id,
          comment.content,
          comment.userId,
        ),
      );
    });
  });

  describe(`/comments/:id (DELETE) - delete comment by id`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login user
      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken1 = result.accessToken;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
      post = await createCorrectPostTest(httpServer, blog.id, accessToken1);
      comment = await createCorrectCommentTest(
        httpServer,
        post.id,
        accessToken1,
      );
    });
    // it(`- (401) jwt access token is incorrect`, async () => {
    //   //jwt is incorrect
    //   const result = await deleteCommentTest(
    //     httpServer,
    //     comment.id,
    //     correctPostId,
    //     'IncorrectJWT',
    //   );
    //   expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    // });
    //
    // it(`- (404) should not delete post because blog is not found with such id
    //           - (404) should not delete post because post is not found with such id`, async () => {
    //   //blogId is incorrect
    //   const result1 = await deletePostTest(
    //     httpServer,
    //     uuidv4(),
    //     correctPostId,
    //     accessToken,
    //   );
    //   expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    //   //postId is incorrect
    //   const result2 = await deletePostTest(
    //     httpServer,
    //     correctBlogId,
    //     uuidv4(),
    //     accessToken,
    //   );
    //   expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    // });
    //
    // it(`- (403) shouldn't delete post if the blog of this post doesn't belong to current user`, async () => {
    //   //creates new user
    //   const newUser = await createUserTest(
    //     httpServer,
    //     'user2',
    //     'correctPass',
    //     'email2@gmail.com',
    //   );
    //   expect(newUser.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
    //
    //   const result1 = await loginUserTest(
    //     httpServer,
    //     newUser.body.login,
    //     'correctPass',
    //   );
    //   expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
    //   const accessToken2 = result1.body.accessToken;
    //
    //   //403 (update blog that doesn't belong this user
    //   const result2 = await deletePostTest(
    //     httpServer,
    //     correctBlogId,
    //     correctPostId,
    //     accessToken2,
    //   );
    //   expect(result2.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);
    // });
    //
    // it(`+ (204) should delete post`, async () => {
    //   const result = await deletePostTest(
    //     httpServer,
    //     correctBlogId,
    //     correctPostId,
    //     accessToken,
    //   );
    //   expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
    //
    //   //check that post is deleted
    //   const post = await getPostByIdPublicTest(httpServer, correctPostId);
    //   expect(post.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    // });
  });
});
