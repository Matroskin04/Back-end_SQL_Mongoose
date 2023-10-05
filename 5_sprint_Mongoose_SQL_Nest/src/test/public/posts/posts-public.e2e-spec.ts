import { INestApplication } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import {
  createCorrectBlogTest,
  createCorrectPostTest,
  createCorrectUserTest,
  loginCorrectUserTest,
} from '../../helpers/chains-of-requests.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import {
  create9PostsOf3BlogsBy3Users,
  createResponseSinglePost,
  getPostByIdPublicTest,
  getPostsPublicTest,
  updateStatusLikeOfPostTest,
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
import { createBlogTest } from '../../blogger/blogs/blogs-blogger.helpers';

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
  let accessToken4;
  let userId1;
  let userId2;
  let userId3;
  let userId4;

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
      const blog1 = await createBlogTest(
        httpServer,
        result[0].accessToken,
        'Blog 1',
      );
      const blog2 = await createBlogTest(
        httpServer,
        result[1].accessToken,
        'blog 2',
      );
      const blog3 = await createBlogTest(
        httpServer,
        result[2].accessToken,
        'c blog 3',
      );
      //create 10 blogs by 3 users
      const postsInfo = await create9PostsOf3BlogsBy3Users(
        httpServer,
        [blog1.body.id, blog2.body.id, blog3.body.id],
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
              + (200) should return 5 posts (query: sortBy=shortDescription&&pageSize=5)`, async () => {
      //sortBy=name, total 9 posts
      const result1 = await getPostsPublicTest(
        httpServer,
        'sortBy=title&&pageSize=5',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllPostsTest(
          [...postsIds].slice(0, 5),
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
          [...postsIds].slice(0, 5),
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
        'sortBy=title&pageSize=5',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        createResponseAllPostsTest(
          [...postsIds].slice(0, 5),
          null,
          null,
          null,
          9,
          2,
          1,
          5,
        ),
      );
    });

    it(`+ (200) should return 9 posts (query: sortDirection=asc)
              + (200) should return 9 posts (query: sortBy=id&&sortDirection=desc)
              + (200) should return 9 posts (query: sortBy=blogName&&sortDirection=desc)`, async () => {
      //sortDirection=asc, total 9 posts
      const result1 = await getPostsPublicTest(httpServer, 'sortDirection=asc');
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllPostsTest(
          [...postsIds].reverse(),
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
      const result2 = await getPostsPublicTest(
        httpServer,
        'sortBy=id&sortDirection=desc',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllPostsTest(
          [...postsIds].sort().reverse(),
          null,
          null,
          null,
          9,
          1,
          1,
          10,
        ),
      );

      //sortBy=blogName&sortDirection=desc, total 9 posts
      const result3 = await getPostsPublicTest(
        httpServer,
        'sortBy=blogName&sortDirection=desc',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        createResponseAllPostsTest(9, null, null, null, 9, 1, 1, 10, [
          'c blog 3',
          'c blog 3',
          'c blog 3',
          'blog 2',
          'blog 2',
          'blog 2',
          'Blog 1',
          'Blog 1',
          'Blog 1',
        ]),
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
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
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
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['sortDirection']));
    });
  });

  describe(`/posts/:id/like-status (PUT) - update like status of a post
                  (Addition) /posts (GET) - get all posts
                  (Addition) /posts/:id (GET) - get post by id`, () => {
    let correctPostId;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login user
      const result = await createAndLogin3UsersTest(httpServer);
      accessToken1 = result[0].accessToken;
      accessToken2 = result[1].accessToken;
      accessToken3 = result[2].accessToken;
      userId1 = result[0].userId;
      userId2 = result[1].userId;
      userId3 = result[2].userId;

      //4 login
      user = await createCorrectUserTest(httpServer);
      const result2 = await loginCorrectUserTest(httpServer);
      accessToken4 = result2.accessToken;
      userId4 = user.id;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
      post = await createCorrectPostTest(httpServer, blog.id, accessToken1);
      correctPostId = post.id;
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await updateStatusLikeOfPostTest(
        httpServer,
        post.id,
        'Like',
        'IncorrectJWT',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) post with such id is not found`, async () => {
      const result = await updateStatusLikeOfPostTest(
        httpServer,
        uuidv4(),
        'Like',
        accessToken1,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`- (400) value of likeStatus should be one of 'None'/'Like'/'Dislike'`, async () => {
      const result = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Incorrect',
        accessToken1,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result.body).toEqual(createErrorsMessageTest(['likeStatus']));
    });

    //check count of likes/dislikes changing
    it(`+ (204) should Like post by user1
              + (204) should None post by user1
              + (204) should Dislike post by user1
              + (204) should None post by user1`, async () => {
      //Like and check
      const result1 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Like',
        accessToken1,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkPost1 = await getPostByIdPublicTest(
        httpServer,
        correctPostId,
        accessToken1,
      );

      expect(checkPost1.body).toEqual(
        createResponseSinglePost(
          correctPostId,
          null,
          null,
          null,
          null,
          null,
          1,
          0,
          'Like',
        ),
      );

      //None and check
      const result2 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'None',
        accessToken1,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkPost2 = await getPostByIdPublicTest(
        httpServer,
        correctPostId,
        accessToken1,
      );
      expect(checkPost2.body).toEqual(
        createResponseSinglePost(
          correctPostId,
          null,
          null,
          null,
          null,
          null,
          0,
          0,
        ),
      );

      //Dislike and check
      const result3 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Dislike',
        accessToken1,
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkPost3 = await getPostByIdPublicTest(
        httpServer,
        correctPostId,
        accessToken1,
      );
      expect(checkPost3.body).toEqual(
        createResponseSinglePost(
          correctPostId,
          null,
          null,
          null,
          null,
          null,
          0,
          1,
          'Dislike',
        ),
      );

      //None and check
      const result4 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'None',
        accessToken1,
      );
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkPost4 = await getPostByIdPublicTest(
        httpServer,
        correctPostId,
        accessToken1,
      );
      expect(checkPost4.body).toEqual(
        createResponseSinglePost(
          correctPostId,
          null,
          null,
          null,
          null,
          null,
          0,
          0,
        ),
      );
    });

    //check count of likes/dislikes changing
    it(`+ (204) should Like 2 times post by user1 (number of likes should increase by 1)
              + (204) should Dislike 2 times post by user1 (number of Dislikes should increase by 1)
              + (204) should Like post by user1`, async () => {
      //Like and check
      const result1 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Like',
        accessToken1,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      const result12 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Like',
        accessToken1,
      );
      expect(result12.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkPost1 = await getPostByIdPublicTest(
        httpServer,
        correctPostId,
        accessToken1,
      );
      expect(checkPost1.body).toEqual(
        createResponseSinglePost(
          correctPostId,
          null,
          null,
          null,
          null,
          null,
          1,
          0,
          'Like',
        ),
      );

      //Dislike and check
      const result2 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Dislike',
        accessToken1,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      const result22 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Dislike',
        accessToken1,
      );
      expect(result22.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkPost2 = await getPostByIdPublicTest(
        httpServer,
        correctPostId,
        accessToken1,
      );
      expect(checkPost2.body).toEqual(
        createResponseSinglePost(
          correctPostId,
          null,
          null,
          null,
          null,
          null,
          0,
          1,
          'Dislike',
        ),
      );

      //Like and check
      const result3 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Like',
        accessToken1,
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkPost3 = await getPostByIdPublicTest(
        httpServer,
        correctPostId,
        accessToken1,
      );
      expect(checkPost3.body).toEqual(
        createResponseSinglePost(
          correctPostId,
          null,
          null,
          null,
          null,
          null,
          1,
          0,
          'Like',
        ),
      );
    });

    //check likes logic with several users
    it(`(Addition) + (200) should return post
              + (204) should Like post by user1 (number of likes = 1)
              + (204) should Like post by user2 (number of likes = 2)
              + (204) should Like post by user3 (number of likes = 3)
              + (204) should Dislike post by user4 (number of dislikes = 1)
              + (204) should Dislike post by user3 (number of likes = 2, dislikes = 2)`, async () => {
      //Like by user1 and check
      const result1 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Like',
        accessToken1,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      //check without jwt (status like should be 'None')
      const checkPost1 = await getPostByIdPublicTest(httpServer, correctPostId);
      expect(checkPost1.body).toEqual(
        createResponseSinglePost(
          correctPostId,
          null,
          null,
          null,
          null,
          null,
          1,
          0,
        ),
      );

      //Like by user2 and check
      const result2 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Like',
        accessToken2,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      //check without jwt (status like should be 'None')
      const checkPost2 = await getPostByIdPublicTest(httpServer, correctPostId);
      expect(checkPost2.body.extendedLikesInfo.likesCount).toBe(2);
      expect(checkPost2.body.extendedLikesInfo.myStatus).toBe('None');

      //Like by user3 and check
      const result3 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Like',
        accessToken3,
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkPost3 = await getPostByIdPublicTest(
        httpServer,
        correctPostId,
        accessToken3,
      );
      expect(checkPost3.body.extendedLikesInfo.likesCount).toBe(3);
      expect(checkPost3.body.extendedLikesInfo.myStatus).toBe('Like');

      //Dislike by user4 and check
      const result4 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Dislike',
        accessToken4,
      );
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkPost4 = await getPostByIdPublicTest(
        httpServer,
        correctPostId,
        accessToken4,
      );
      expect(checkPost3.body.extendedLikesInfo.likesCount).toBe(3);
      expect(checkPost4.body.extendedLikesInfo.dislikesCount).toBe(1);
      expect(checkPost4.body.extendedLikesInfo.myStatus).toBe('Dislike');

      //Dislike by user3 and check
      const result5 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Dislike',
        accessToken3,
      );
      expect(result5.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkPost5 = await getPostByIdPublicTest(
        httpServer,
        correctPostId,
        accessToken3,
      );
      expect(checkPost5.body.extendedLikesInfo.likesCount).toBe(2);
      expect(checkPost5.body.extendedLikesInfo.dislikesCount).toBe(2);
      expect(checkPost5.body.extendedLikesInfo.myStatus).toBe('Dislike');
    });

    //dependent
    //check newestLikes
    it(`(Addition) + (200) should return post
              + (204) should Like post by user3 (number of likes = 3)
              + (204) should Like post by user4 (number of likes = 4)
              + (200) should return 3 newestLikes (user2,3,4)
              + (204) should None and then Like post by user1
              + (200) should return 3 newestLikes (user2,3,4 (newestLikes1 should be equal newestLikes2)`, async () => {
      //Like by user3
      const result1 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Like',
        accessToken3,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      //Like by user4
      const result2 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Like',
        accessToken4,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //3 newestLikes (user4, 3, 2)
      const checkPost1 = await getPostByIdPublicTest(httpServer, correctPostId);
      const newestLikes1 = checkPost1.body.extendedLikesInfo.newestLikes;
      expect(newestLikes1.map((e) => e.userId)).toEqual([
        userId4,
        userId3,
        userId2,
      ]);

      //None by user1
      const result3 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'None',
        accessToken1,
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      const checkPost2 = await getPostByIdPublicTest(httpServer, correctPostId);
      expect(checkPost2.body.extendedLikesInfo.likesCount).toBe(3);

      //Like by user1
      const result4 = await updateStatusLikeOfPostTest(
        httpServer,
        correctPostId,
        'Like',
        accessToken1,
      );
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      const checkPost3 = await getPostByIdPublicTest(httpServer, correctPostId);
      expect(checkPost3.body.extendedLikesInfo.likesCount).toBe(4);

      //3 newestLikes 1 is equal newestLikes 2
      const checkPost4 = await getPostByIdPublicTest(httpServer, correctPostId);
      const newestLikes2 = checkPost4.body.extendedLikesInfo.newestLikes;
      expect(newestLikes2).toEqual(newestLikes1);
    });
  });
});
