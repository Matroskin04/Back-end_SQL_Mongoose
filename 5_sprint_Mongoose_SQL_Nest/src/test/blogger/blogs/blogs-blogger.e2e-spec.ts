import { INestApplication } from '@nestjs/common';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { loginUserTest } from '../../public/auth/auth-public.helpers';
import { v4 as uuidv4 } from 'uuid';
import { createErrorsMessageTest } from '../../utils/general/errors-message.helper';
import { getPostByIdPublicTest } from '../../public/posts/posts-public.helpers';
import { getBlogByIdPublicTest } from '../../public/blogs/blogs-public.helpers';
import { deleteAllDataTest } from '../../utils/general/delete-all-data.helper';
import {
  createCorrectBlogTest,
  createCorrectPostTest,
  createCorrectUserTest,
  loginCorrectUserTest,
} from '../../utils/general/chains-of-requests.helpers';
import { getAllCommentsOfBloggerTest } from './comments-blogger.helpers';
import {
  createCommentTest,
  createResponseCommentsOfBlogger,
} from '../../public/comments/comments-public.helpers';
import { startApp } from '../../test.utils';
import { usersRequestsTestManager } from '../../utils/users/users-requests-test.manager';
import { blogsRequestsTestManager } from '../../utils/blogs/blogs-requests-test.manager';
import { blogsResponsesTestManager } from '../../utils/blogs/blogs-responses-test.manager';
import { postsRequestsTestManager } from '../../utils/post/posts-requests-test.manager';
import { postsResponsesTestManager } from '../../utils/post/posts-responses-test.manager';
import {
  createResponseAllPostsTest,
  getPostsOfBlogPublicTest,
} from '../../public/blogs/posts-blogs-puclic.helpers';

describe('Blogs, Post, Comments (Blogger); /blogger', () => {
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
  let accessToken;
  const correctPass = 'Password1';

  //blogs
  let correctBlogId;
  const correctBlogName = 'correctName';
  const correctDescription = 'correctDescription';
  const correctWebsiteUrl =
    'https://SoBqgeyargbRK5jx76KYc6XS3qU9LWMJCvbDif9VXOiplGf4-RK0nhw34lvql.zgG73ki0po16f.J4U96ZRvoH3VE_WK';

  //posts
  let correctPostId;
  const correctTitle = 'correctTitle';
  const correctShortDescription = 'correctShortDescription';
  const correctPostContent = 'correctContent';

  //incorrectData blogs
  const nameLength16 = 'a'.repeat(16);
  const blogWebSiteLength101 = 'a'.repeat(101);
  const blogDescriptionLength501 = 'a'.repeat(501);

  //incorrectData posts
  const titleLength31 = 'a'.repeat(31);
  const postShortDescriptionLength101 = 'a'.repeat(101);
  const postContentLength1001 = 'a'.repeat(1001);

  describe(`/blogs (POST) - create blog`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken = result.accessToken;
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await blogsRequestsTestManager.createBlogBlogger(
        httpServer,
        'IncorrectJWT',
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (400) values of 'name', 'website' and 'description' are incorrect (large length)
              - (400) values of 'name' (not string), 'website' (incorrect format) and 'description' (not string) are incorrect`, async () => {
      const result1 = await blogsRequestsTestManager.createBlogBlogger(
        httpServer,
        accessToken,
        nameLength16,
        blogDescriptionLength501,
        blogWebSiteLength101,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(
        createErrorsMessageTest(['name', 'description', 'websiteUrl']),
      );

      const result2 = await blogsRequestsTestManager.createBlogBlogger(
        httpServer,
        accessToken,
        null,
        null,
        'IncorrectURL',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['websiteUrl']));
    });

    it(`+ (201) should create blog`, async () => {
      const result = await blogsRequestsTestManager.createBlogBlogger(
        httpServer,
        accessToken,
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      expect(result.body).toEqual(
        blogsResponsesTestManager.createResponseSingleBlogBlogger(
          result.body.id,
          correctBlogName,
          correctDescription,
          correctWebsiteUrl,
        ),
      );
    });
  });

  describe(`/blogs (GET) - get all blogs`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken = result.accessToken;
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await blogsRequestsTestManager.createBlogBlogger(
        httpServer,
        'IncorrectJWT',
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) should return empty array`, async () => {
      const result = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        accessToken,
        '',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        blogsResponsesTestManager.createResponseAllBlogsBlogger([]),
      );
    });
  });

  describe(`/blogs/:id (PUT) - update blog by id`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken = result.accessToken;

      const blog = await createCorrectBlogTest(httpServer, accessToken);
      correctBlogId = blog.id;
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await blogsRequestsTestManager.updateBlogBlogger(
        httpServer,
        correctBlogId,
        'IncorrectJWT',
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (400) values of 'name', 'website' and 'description' are incorrect (large length)
              - (400) values of 'name' (not string), 'website' (incorrect format) and 'description' (not string) are incorrect`, async () => {
      const result1 = await blogsRequestsTestManager.updateBlogBlogger(
        httpServer,
        correctBlogId,
        accessToken,
        nameLength16,
        blogDescriptionLength501,
        blogWebSiteLength101,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(
        createErrorsMessageTest(['name', 'description', 'websiteUrl']),
      );

      const result2 = await blogsRequestsTestManager.updateBlogBlogger(
        httpServer,
        correctBlogId,
        accessToken,
        null,
        null,
        'IncorrectURL',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(
        createErrorsMessageTest(['name', 'description', 'websiteUrl']),
      );
    });

    it(`- (403) shouldn't update blog if the blog doesn't belong to current user`, async () => {
      //creates new user
      const newUser = await usersRequestsTestManager.createUserSa(
        httpServer,
        'user2',
        correctPass,
        'email2@gmail.com',
      );
      expect(newUser.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

      const result1 = await loginUserTest(
        httpServer,
        newUser.body.login,
        correctPass,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      const accessToken2 = result1.body.accessToken;

      //403 (update blog that doesn't belong this user
      const result2 = await blogsRequestsTestManager.updateBlogBlogger(
        httpServer,
        correctBlogId,
        accessToken2,
        nameLength16,
        blogDescriptionLength501,
        blogWebSiteLength101,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);
    });

    it(`- (404) should not update blog because blog is not found with such id`, async () => {
      const result = await blogsRequestsTestManager.updateBlogBlogger(
        httpServer,
        uuidv4(),
        accessToken,
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (204) should update blog`, async () => {
      const result = await blogsRequestsTestManager.updateBlogBlogger(
        httpServer,
        correctBlogId,
        accessToken,
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check blog with updating data
      const blog = await getBlogByIdPublicTest(httpServer, correctBlogId);
      expect(blog.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(blog.body).toEqual(
        blogsResponsesTestManager.createResponseSingleBlogBlogger(
          correctBlogId,
          correctBlogName,
          correctDescription,
          correctWebsiteUrl,
        ),
      );
    });
  });

  describe(`/blogs/:id (DELETE) - delete blog by id`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken = result.accessToken;

      const blog = await createCorrectBlogTest(httpServer, accessToken);
      correctBlogId = blog.id;
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await blogsRequestsTestManager.deleteBlogBlogger(
        httpServer,
        correctBlogId,
        'IncorrectJWT',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (403) shouldn't delete blog if the blog doesn't belong to current user`, async () => {
      //creates new user
      const newUser = await usersRequestsTestManager.createUserSa(
        httpServer,
        'user2',
        correctPass,
        'email2@gmail.com',
      );
      expect(newUser.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

      const result1 = await loginUserTest(
        httpServer,
        newUser.body.login,
        correctPass,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      const accessToken2 = result1.body.accessToken;

      //403 (update blog that doesn't belong this user
      const result2 = await blogsRequestsTestManager.deleteBlogBlogger(
        httpServer,
        correctBlogId,
        accessToken2,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);
    });

    it(`- (404) should not delete blog because blog doesn't exist with such id`, async () => {
      const result = await blogsRequestsTestManager.deleteBlogBlogger(
        httpServer,
        uuidv4(),
        accessToken,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (204) should delete blog`, async () => {
      const result = await blogsRequestsTestManager.deleteBlogBlogger(
        httpServer,
        correctBlogId,
        accessToken,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check that blog is deleted
      const blog = await getBlogByIdPublicTest(httpServer, correctBlogId);
      expect(blog.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });
  });

  describe(`/blogs/:id/posts (POST) - create post by blogId`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken = result.accessToken;

      const blog = await createCorrectBlogTest(httpServer, accessToken);
      correctBlogId = blog.id;
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await postsRequestsTestManager.createPostBlogger(
        httpServer,
        correctBlogId,
        'IncorrectJWT',
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) should not create post because blog doesn't exist with such id`, async () => {
      const result = await postsRequestsTestManager.createPostBlogger(
        httpServer,
        uuidv4(),
        accessToken,
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`- (400) values of 'title', 'shortDescription' and 'content' are incorrect (large length)
              - (400) values of 'title', 'shortDescription' and 'content' are incorrect (not string)`, async () => {
      const result1 = await postsRequestsTestManager.createPostBlogger(
        httpServer,
        correctBlogId,
        accessToken,
        titleLength31,
        postShortDescriptionLength101,
        postContentLength1001,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(
        createErrorsMessageTest(['title', 'shortDescription', 'content']),
      );

      const result2 = await postsRequestsTestManager.createPostBlogger(
        httpServer,
        correctBlogId,
        accessToken,
        null,
        null,
        null,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(
        createErrorsMessageTest(['title', 'shortDescription', 'content']),
      );
    });

    it(`- (403) shouldn't create post if the blog doesn't belong to current user`, async () => {
      //creates new user
      const newUser = await usersRequestsTestManager.createUserSa(
        httpServer,
        'user2',
        correctPass,
        'email2@gmail.com',
      );
      expect(newUser.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

      const result1 = await loginUserTest(
        httpServer,
        newUser.body.login,
        correctPass,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      const accessToken2 = result1.body.accessToken;

      //403 (update blog that doesn't belong this user
      const result2 = await postsRequestsTestManager.createPostBlogger(
        httpServer,
        correctBlogId,
        accessToken2,
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);
    });

    it(`+ (201) should create post`, async () => {
      const result = await postsRequestsTestManager.createPostBlogger(
        httpServer,
        correctBlogId,
        accessToken,
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      expect(result.body).toEqual(
        postsResponsesTestManager.createResponseSinglePostBlogger(
          correctTitle,
          correctShortDescription,
          correctPostContent,
          correctBlogId,
        ),
      );
    });
  });

  describe(`/blogs/:id/posts (GET) - get all posts of the blog`, () => {
    let postsIds;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken = result.accessToken;

      const blog = await createCorrectBlogTest(httpServer, accessToken);
      correctBlogId = blog.id;
      //create 9 posts of 3 blogs by 3 users
      postsIds = await postsRequestsTestManager.create9PostsOfBlog(
        httpServer,
        blog.id,
        accessToken,
      );
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await postsRequestsTestManager.getAllPostsBlogger(
        httpServer,
        correctBlogId,
        'IncorrectJWT',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) should not return posts because of blog with such id doesn't exist`, async () => {
      const result = await postsRequestsTestManager.getAllPostsBlogger(
        httpServer,
        uuidv4(),
        accessToken,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (200) should return 9 posts of blog by id`, async () => {
      const result = await postsRequestsTestManager.getAllPostsBlogger(
        httpServer,
        correctBlogId,
        accessToken,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseAllPostsTest(postsIds, null, null, null, 9, 1, 1, 10),
      );
    });

    it(`+ (200) should return 3 posts (query: pageSize=3, pageNumber=2)
              + (200) should return 4 posts (query: pageSize=5, pageNumber=2)`, async () => {
      //3 posts
      const result1 = await postsRequestsTestManager.getAllPostsBlogger(
        httpServer,
        correctBlogId,
        accessToken,
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
      const result2 = await postsRequestsTestManager.getAllPostsBlogger(
        httpServer,
        correctBlogId,
        accessToken,
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
      const result1 = await postsRequestsTestManager.getAllPostsBlogger(
        httpServer,
        correctBlogId,
        accessToken,
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
      const result2 = await postsRequestsTestManager.getAllPostsBlogger(
        httpServer,
        correctBlogId,
        accessToken,
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
      const result3 = await postsRequestsTestManager.getAllPostsBlogger(
        httpServer,
        correctBlogId,
        accessToken,
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
      const result4 = await postsRequestsTestManager.getAllPostsBlogger(
        httpServer,
        correctBlogId,
        accessToken,
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

      //sortBy=id&&sortDirection=desc, total 9 posts
      const result5 = await postsRequestsTestManager.getAllPostsBlogger(
        httpServer,
        correctBlogId,
        accessToken,
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
      const result1 = await postsRequestsTestManager.getAllPostsBlogger(
        httpServer,
        correctBlogId,
        accessToken,
        'sortBy=Truncate;',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['sortBy']));

      //status 400
      const result2 = await postsRequestsTestManager.getAllPostsBlogger(
        httpServer,
        correctBlogId,
        accessToken,
        'sortDirection=Truncate;',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['sortDirection']));
    });
  });

  describe(`/blogs/:id/posts/:id (PUT) - update post by blogId and postId`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken = result.accessToken;

      const blog = await createCorrectBlogTest(httpServer, accessToken);
      correctBlogId = blog.id;

      const post = await createCorrectPostTest(
        httpServer,
        correctBlogId,
        accessToken,
      );
      correctPostId = post.id;
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await postsRequestsTestManager.updatePostBlogger(
        httpServer,
        correctBlogId,
        correctPostId,
        'IncorrectJWT',
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) should not update post because blog is not found with such id
              - (404) should not update post because post is not found with such id`, async () => {
      //blogId is incorrect
      const result1 = await postsRequestsTestManager.updatePostBlogger(
        httpServer,
        uuidv4(),
        correctPostId,
        accessToken,
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
      //postId is incorrect
      const result2 = await postsRequestsTestManager.updatePostBlogger(
        httpServer,
        correctBlogId,
        uuidv4(),
        accessToken,
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`- (403) shouldn't update post if the blog of this post doesn't belong to current user`, async () => {
      //creates new user
      const newUser = await usersRequestsTestManager.createUserSa(
        httpServer,
        'user2',
        correctPass,
        'email2@gmail.com',
      );
      expect(newUser.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

      const result1 = await loginUserTest(
        httpServer,
        newUser.body.login,
        correctPass,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      const accessToken2 = result1.body.accessToken;

      //403 (update blog that doesn't belong this user
      const result2 = await postsRequestsTestManager.updatePostBlogger(
        httpServer,
        correctBlogId,
        correctPostId,
        accessToken2,
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);
    });

    it(`- (400) values of 'title', 'shortDescription' and 'content' are incorrect (large length)
              - (400) values of 'title', 'shortDescription' and 'content' are incorrect (not string)`, async () => {
      const result1 = await postsRequestsTestManager.updatePostBlogger(
        httpServer,
        correctBlogId,
        correctPostId,
        accessToken,
        titleLength31,
        postShortDescriptionLength101,
        postContentLength1001,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(
        createErrorsMessageTest(['title', 'shortDescription', 'content']),
      );

      const result2 = await postsRequestsTestManager.updatePostBlogger(
        httpServer,
        correctBlogId,
        correctPostId,
        accessToken,
        null,
        null,
        null,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(
        createErrorsMessageTest(['title', 'shortDescription', 'content']),
      );
    });

    it(`+ (204) should update post`, async () => {
      const result = await postsRequestsTestManager.updatePostBlogger(
        httpServer,
        correctBlogId,
        correctPostId,
        accessToken,
        'newTitle',
        'newShortDescription',
        'newContent',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check post with updating data
      const post = await getPostByIdPublicTest(httpServer, correctPostId);
      expect(post.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(post.body).toEqual(
        postsResponsesTestManager.createResponseSinglePostBlogger(
          'newTitle',
          'newShortDescription',
          'newContent',
          correctBlogId,
        ),
      );
    });
  });

  describe(`/blogs/:id/posts/:id (DELETE) - delete post by blogId and postId`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken = result.accessToken;

      const blog = await createCorrectBlogTest(httpServer, accessToken);
      correctBlogId = blog.id;

      const post = await createCorrectPostTest(
        httpServer,
        correctBlogId,
        accessToken,
      );
      correctPostId = post.id;
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await postsRequestsTestManager.deletePostBlogger(
        httpServer,
        correctBlogId,
        correctPostId,
        'IncorrectJWT',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) should not delete post because blog is not found with such id
              - (404) should not delete post because post is not found with such id`, async () => {
      //blogId is incorrect
      const result1 = await postsRequestsTestManager.deletePostBlogger(
        httpServer,
        uuidv4(),
        correctPostId,
        accessToken,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
      //postId is incorrect
      const result2 = await postsRequestsTestManager.deletePostBlogger(
        httpServer,
        correctBlogId,
        uuidv4(),
        accessToken,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`- (403) shouldn't delete post if the blog of this post doesn't belong to current user`, async () => {
      //creates new user
      const newUser = await usersRequestsTestManager.createUserSa(
        httpServer,
        'user2',
        correctPass,
        'email2@gmail.com',
      );
      expect(newUser.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

      const result1 = await loginUserTest(
        httpServer,
        newUser.body.login,
        correctPass,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      const accessToken2 = result1.body.accessToken;

      //403 (update blog that doesn't belong this user
      const result2 = await postsRequestsTestManager.deletePostBlogger(
        httpServer,
        correctBlogId,
        correctPostId,
        accessToken2,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);
    });

    it(`+ (204) should delete post`, async () => {
      const result = await postsRequestsTestManager.deletePostBlogger(
        httpServer,
        correctBlogId,
        correctPostId,
        accessToken,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check that post is deleted
      const post = await getPostByIdPublicTest(httpServer, correctPostId);
      expect(post.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });
  });

  describe(`/blogs/comments (GET) - get all comments of the blogger
                  (Addition) /blogs, /blogs/:id/posts (POST) - create addition blog and 2 posts for blog 1 and 2
                  (Addition) /posts/:id/comments (POST) -  should create 6 comments by 3 users`, () => {
    let accessToken2;
    let accessToken3;
    let correctPostId2;
    let correctPostId3;
    let correctPostId4;
    let correctBlogId2;

    let commentId1;
    let commentId2;
    let commentId3;
    let commentId4;
    let commentId5;
    let commentId6;

    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken = result.accessToken;

      const blog = await createCorrectBlogTest(httpServer, accessToken);
      correctBlogId = blog.id;

      const post = await createCorrectPostTest(
        httpServer,
        correctBlogId,
        accessToken,
      );
      correctPostId = post.id;

      //comment 1 by user 1, blog 1, post 1
      const comment1 = await createCommentTest(
        httpServer,
        correctPostId,
        accessToken,
        'Comment 1 by the first User',
      );
      expect(comment1.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      commentId1 = comment1.body.id;

      //comment 2 by user 2 blog 1, post 1(1)(blog 1)
      const user2 = await usersRequestsTestManager.createUserSa(
        httpServer,
        'login2',
        'Password2',
        'email2@mail.ru',
      );
      expect(user2.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

      const result1 = await loginUserTest(httpServer, 'login2', 'Password2');
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      accessToken2 = result1.body.accessToken;

      const comment2 = await createCommentTest(
        httpServer,
        correctPostId,
        accessToken2,
        'Comment 2 by the second User',
      );
      expect(comment2.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      commentId2 = comment2.body.id;

      //comment 3 by user 2, blog 1, post 2(2)(blog 1)
      const post2 = await postsRequestsTestManager.createPostBlogger(
        httpServer,
        correctBlogId,
        accessToken,
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(post2.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      correctPostId2 = post2.body.id;

      const comment3 = await createCommentTest(
        httpServer,
        correctPostId2,
        accessToken2,
        'Comment 3 by the second User',
      );
      expect(comment3.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      commentId3 = comment3.body.id;

      //comment 4 by user 2, blog 2, post 1(3)(blog 2)
      const blog2 = await blogsRequestsTestManager.createBlogBlogger(
        httpServer,
        accessToken,
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
      );
      expect(blog2.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      correctBlogId2 = blog2.body.id;

      const post3 = await postsRequestsTestManager.createPostBlogger(
        httpServer,
        correctBlogId2,
        accessToken,
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(post3.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      correctPostId3 = post3.body.id;

      const comment4 = await createCommentTest(
        httpServer,
        correctPostId3,
        accessToken2,
        'Comment 4 by the second User',
      );
      expect(comment4.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      commentId4 = comment4.body.id;

      //comment 5 by user 3, blog 2, post 1(3)(blog 2)
      const user3 = await usersRequestsTestManager.createUserSa(
        httpServer,
        'login3',
        'Password3',
        'email3@mail.ru',
      );
      expect(user3.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

      const result3 = await loginUserTest(httpServer, 'login3', 'Password3');
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      accessToken3 = result3.body.accessToken;

      const comment5 = await createCommentTest(
        httpServer,
        correctPostId3,
        accessToken3,
        'Comment 5 by the third User',
      );
      expect(comment5.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      commentId5 = comment5.body.id;

      //comment 6 by user 3, blog 2, post 2(4)(blog 2)
      const post4 = await postsRequestsTestManager.createPostBlogger(
        httpServer,
        correctBlogId,
        accessToken,
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(post4.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      correctPostId4 = post4.body.id;

      const comment6 = await createCommentTest(
        httpServer,
        correctPostId4,
        accessToken3,
        'Comment 4 by the second User',
      );
      expect(comment6.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201); //todo in function
      commentId6 = comment6.body.id;
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await getAllCommentsOfBloggerTest(
        httpServer,
        'IncorrectJWT',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) should return array of 6 comments`, async () => {
      //getAllComments
      const result = await getAllCommentsOfBloggerTest(httpServer, accessToken);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseCommentsOfBlogger(
          [
            commentId6,
            commentId5,
            commentId4,
            commentId3,
            commentId2,
            commentId1,
          ],
          [
            correctPostId4,
            correctPostId3,
            correctPostId3,
            correctPostId2,
            correctPostId,
            correctPostId,
          ],
          null,
          null,
          null,
          6,
        ),
      );
    });
  });
});
