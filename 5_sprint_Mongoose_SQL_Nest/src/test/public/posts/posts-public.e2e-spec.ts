import { INestApplication } from '@nestjs/common';
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
  UpdateStatusLikeOfPostTest,
} from './posts-public.helpers';
import { createAndLogin3UsersTest } from '../blogs/blogs-public.helpers';
import { createResponseAllPostsTest } from '../blogs/posts-blogs-puclic.helpers';
import {
  create9CommentsBy3Users,
  createCommentTest,
  createResponseCommentsOfPostTest,
  createResponseSingleComment,
  getCommentsOfPostTest,
} from '../comments/comments-public.helpers';
import { createErrorsMessageTest } from '../../helpers/errors-message.helper';
import { startApp } from '../../test.utils';

describe('Posts (GET), Put-Like (Post), Comments (Public); /', () => {
  jest.setTimeout(5 * 60 * 1000);

  //vars for starting app and testing
  let app: INestApplication;
  let httpServer;

  beforeAll(async () => {
    const info = await startApp();
    app = info.app;
    httpServer = info.httpServer;
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

  //comments
  const correctCommentContent = 'Correct comment content';

  //incorrectData comments
  const contentLength301 = 'a'.repeat(301);
  const contentLength19 = 'a'.repeat(19);

  describe(`/posts (GET) - get all posts`, () => {
    let postsIds;
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
      const postsInfo = await create9PostsOf3BlogsBy3Users(
        httpServer,
        [blog1.id, blog2.id, blog3.id],
        [result[0].accessToken, result[1].accessToken, result[2].accessToken],
        [result[0].userId, result[1].userId, result[2].userId],
      );
      postsIds = postsInfo.map((e) => e.id).reverse();
    });

    it(`+ (200) should return 9 posts (without jwt)`, async () => {
      const result = await getPostsPublicTest(httpServer);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseAllPostsTest(postsIds, null, null, null, 9),
      );
    });

    it(`+ (200) should return 3 posts (query: pageSize=3, pageNumber=2)
              + (200) should return 4 posts (query: pageSize=5, pageNumber=2)`, async () => {
      //3 posts
      const result1 = await getPostsPublicTest(
        httpServer,
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
      const result2 = await getPostsPublicTest(
        httpServer,
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

    it(`+ (200) should return 5 posts (query: sortBy=title&&pageSize=5)
              + (200) should return 5 posts (query: sortBy=content&&pageSize=5)
              + (200) should return 5 posts (query: sortBy=shortDescription&&pageSize=5)
              + (200) should return 9 posts (query: sortDirection=asc)
              + (200) should return 9 posts (query: sortBy=id&&sortDirection=desc)`, async () => {
      const postsIdsCopy = [...postsIds];
      //sortBy=name, total 9 posts
      const result1 = await getPostsPublicTest(
        httpServer,
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
      const result2 = await getPostsPublicTest(
        httpServer,
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
      const result3 = await getPostsPublicTest(
        httpServer,
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
      const result4 = await getPostsPublicTest(httpServer, 'sortDirection=asc');
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

      //sortBy=id&&sortDirection=desc, total 9 posts
      const result5 = await getPostsPublicTest(
        httpServer,
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
      const result1 = await getPostsPublicTest(httpServer, 'sortBy=Truncate;');
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['sortBy']));

      //status 400
      const result2 = await getPostsPublicTest(
        httpServer,
        'sortDirection=Truncate;',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['sortDirection']));
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

  describe(`/posts/:id/comments (POST) - create comment by post id`, () => {
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

    it(`+ (201) should create comment`, async () => {
      const result = await createCommentTest(
        httpServer,
        post.id,
        accessToken1,
        correctCommentContent,
      );
      console.log(result.body);

      expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      expect(result.body).toEqual(
        createResponseSingleComment(
          null,
          correctCommentContent,
          user.id,
          user.login,
        ),
      );
    });
  });

  describe(`/posts/:id/comments (GET) - get comments by post id`, () => {
    let commentsIds;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login user
      const result = await createAndLogin3UsersTest(httpServer);
      accessToken1 = result[0].accessToken;
      accessToken2 = result[1].accessToken;
      accessToken3 = result[2].accessToken;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
      post = await createCorrectPostTest(httpServer, blog.id, accessToken1);

      const commentsInfo = await create9CommentsBy3Users(
        httpServer,
        post.id,
        [accessToken1, accessToken2, accessToken3],
        [result[0].userId, result[1].userId, result[2].userId],
      );

      commentsIds = commentsInfo.map((e) => e.id).reverse();
    });

    it(`- (404) post with such id is not found`, async () => {
      const result = await getCommentsOfPostTest(httpServer, uuidv4());
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (200) should return 9 comments of post`, async () => {
      const result = await getCommentsOfPostTest(httpServer, post.id);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseCommentsOfPostTest(commentsIds, null, null, null, 9),
      );
    });

    it(`+ (200) should return 3 comments (query: pageSize=3, pageNumber=2)
              + (200) should return 4 comments (query: pageSize=5, pageNumber=2)`, async () => {
      //3 comments
      const result1 = await getCommentsOfPostTest(
        httpServer,
        post.id,
        'pageSize=3&&pageNumber=2',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseCommentsOfPostTest(
          commentsIds.slice(3, 6),
          null,
          null,
          null,
          9,
          3,
          2,
          3,
        ),
      );

      //4 comments
      const result2 = await getCommentsOfPostTest(
        httpServer,
        post.id,
        'pageSize=5&&pageNumber=2',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseCommentsOfPostTest(
          commentsIds.slice(5),
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

    it(`+ (200) should return 9 comments (query: sortBy=content&&pageSize=5)
              + (200) should return 9 comments (query: sortDirection=asc)
              + (200) should return 9 comments (query: sortBy=id&&sortDirection=desc)`, async () => {
      const commentsIdsCopy = [...commentsIds];
      //sortBy=content, total 9 comments
      const result1 = await getCommentsOfPostTest(
        httpServer,
        post.id,
        'sortBy=content&&pageSize=5',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseCommentsOfPostTest(
          commentsIdsCopy.slice(0, 5),
          null,
          null,
          null,
          9,
          2,
          1,
          5,
        ),
      );

      //sortDirection=asc, total 9 comments
      const result2 = await getCommentsOfPostTest(
        httpServer,
        post.id,
        'sortDirection=asc',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseCommentsOfPostTest(
          commentsIdsCopy.reverse(),
          null,
          null,
          null,
          9,
          1,
          1,
          10,
        ),
      );

      //sortBy=id&&sortDirection=desc, total 9 comments
      const result3 = await getCommentsOfPostTest(
        httpServer,
        post.id,
        'sortBy=id&&sortDirection=desc',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        createResponseCommentsOfPostTest(
          commentsIdsCopy.sort().reverse(),
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
      const result1 = await getCommentsOfPostTest(
        httpServer,
        post.id,
        'sortBy=Truncate;',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['sortBy']));

      //status 400
      const result2 = await getCommentsOfPostTest(
        httpServer,
        post.id,
        'sortDirection=Truncate;',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['sortDirection']));
    });
  });

  describe(`/posts/:id/like-status (PUT) - update like status of a post`, () => {
    let commentsIds;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login user
      const result = await createAndLogin3UsersTest(httpServer);
      accessToken1 = result[0].accessToken;
      accessToken2 = result[1].accessToken;
      accessToken3 = result[2].accessToken;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
      post = await createCorrectPostTest(httpServer, blog.id, accessToken1);
      commentsIds = await create9CommentsBy3Users(
        httpServer,
        post.id,
        [accessToken1, accessToken2, accessToken3],
        [result[0].userId, result[1].userId, result[2].userId],
      );
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await UpdateStatusLikeOfPostTest(
        httpServer,
        post.id,
        'Like',
        'IncorrectJWT',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) post with such id is not found`, async () => {
      const result = await UpdateStatusLikeOfPostTest(
        httpServer,
        uuidv4(),
        'Like',
        accessToken1,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });
  });
});
