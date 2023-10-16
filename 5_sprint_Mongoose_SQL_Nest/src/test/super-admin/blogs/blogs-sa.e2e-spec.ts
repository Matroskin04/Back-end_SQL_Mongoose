import { INestApplication } from '@nestjs/common';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { v4 as uuidv4 } from 'uuid';
import { blogsRequestsTestManager } from '../../utils/blogs/blogs-requests-test.manager';
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
import { startApp } from '../../test.utils';
import { blogsResponsesTestManager } from '../../utils/blogs/blogs-responses-test.manager';
import { postsRequestsTestManager } from '../../utils/post/posts-requests-test.manager';
import { postsResponsesTestManager } from '../../utils/post/posts-responses-test.manager';

describe('Blogs, Post (SA); /sa', () => {
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

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await blogsRequestsTestManager.createBlogSa(
        httpServer,
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
        'incorrectLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await blogsRequestsTestManager.createBlogSa(
        httpServer,
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
        null,
        'IncorrectPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (400) values of 'name', 'website' and 'description' are incorrect (large length)
              - (400) values of 'name' (not string), 'website' (incorrect format) and 'description' (not string) are incorrect`, async () => {
      const result1 = await blogsRequestsTestManager.createBlogSa(
        httpServer,
        nameLength16,
        blogDescriptionLength501,
        blogWebSiteLength101,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(
        createErrorsMessageTest(['name', 'description', 'websiteUrl']),
      );

      const result2 = await blogsRequestsTestManager.createBlogSa(
        httpServer,
        null,
        null,
        'IncorrectURL',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(
        createErrorsMessageTest(['name', 'description', 'websiteUrl']),
      );
    });

    it(`+ (201) should create blog`, async () => {
      const result = await blogsRequestsTestManager.createBlogSa(
        httpServer,
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      expect(result.body).toEqual(
        blogsResponsesTestManager.createResponseSingleBlogSa(
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
    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await blogsRequestsTestManager.getAllBlogsSa(
        httpServer,
        '',
        'incorrectLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await blogsRequestsTestManager.getAllBlogsSa(
        httpServer,
        '',
        null,
        'IncorrectPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) should return empty array`, async () => {
      const result = await blogsRequestsTestManager.getAllBlogsSa(
        httpServer,
        '',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        blogsResponsesTestManager.createResponseAllBlogsSa([]),
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

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await blogsRequestsTestManager.updateBlogSa(
        httpServer,
        correctBlogId,
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
        'incorrectLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await blogsRequestsTestManager.updateBlogSa(
        httpServer,
        correctBlogId,
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
        null,
        'IncorrectPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (400) values of 'name', 'website' and 'description' are incorrect (large length)
              - (400) values of 'name' (not string), 'website' (incorrect format) and 'description' (not string) are incorrect`, async () => {
      const result1 = await blogsRequestsTestManager.updateBlogSa(
        httpServer,
        correctBlogId,
        nameLength16,
        blogDescriptionLength501,
        blogWebSiteLength101,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(
        createErrorsMessageTest(['name', 'description', 'websiteUrl']),
      );

      const result2 = await blogsRequestsTestManager.updateBlogSa(
        httpServer,
        correctBlogId,
        null,
        null,
        'IncorrectURL',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(
        createErrorsMessageTest(['name', 'description', 'websiteUrl']),
      );
    });

    it(`- (404) should not update blog because blog is not found with such id`, async () => {
      const result = await blogsRequestsTestManager.updateBlogSa(
        httpServer,
        uuidv4(),
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (204) should update blog`, async () => {
      const result = await blogsRequestsTestManager.updateBlogSa(
        httpServer,
        correctBlogId,
        correctBlogName,
        correctDescription,
        correctWebsiteUrl,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check blog with updating data
      const blog = await getBlogByIdPublicTest(httpServer, correctBlogId);
      expect(blog.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(blog.body).toEqual(
        blogsResponsesTestManager.createResponseSingleBlogSa(
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

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await blogsRequestsTestManager.deleteBlogSa(
        httpServer,
        correctBlogId,
        'incorrectLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await blogsRequestsTestManager.deleteBlogSa(
        httpServer,
        correctBlogId,
        null,
        'IncorrectPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) should not delete blog because blog doesn't exist with such id`, async () => {
      const result = await blogsRequestsTestManager.deleteBlogSa(
        httpServer,
        uuidv4(),
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (204) should delete blog`, async () => {
      const result = await blogsRequestsTestManager.deleteBlogSa(
        httpServer,
        correctBlogId,
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

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await postsRequestsTestManager.createPostSa(
        httpServer,
        correctBlogId,
        correctTitle,
        correctShortDescription,
        correctPostContent,
        'incorrectLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await postsRequestsTestManager.createPostSa(
        httpServer,
        correctBlogId,
        correctTitle,
        correctShortDescription,
        correctPostContent,
        null,
        'IncorrectPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) should not create post because blog doesn't exist with such id`, async () => {
      const result = await postsRequestsTestManager.createPostSa(
        httpServer,
        uuidv4(),
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`- (400) values of 'title', 'shortDescription' and 'content' are incorrect (large length)
              - (400) values of 'title', 'shortDescription' and 'content' are incorrect (not string)`, async () => {
      const result1 = await postsRequestsTestManager.createPostSa(
        httpServer,
        correctBlogId,
        titleLength31,
        postShortDescriptionLength101,
        postContentLength1001,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(
        createErrorsMessageTest(['title', 'shortDescription', 'content']),
      );

      const result2 = await postsRequestsTestManager.createPostSa(
        httpServer,
        correctBlogId,
        null,
        null,
        null,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(
        createErrorsMessageTest(['title', 'shortDescription', 'content']),
      );
    });

    it(`+ (201) should create post`, async () => {
      const result = await postsRequestsTestManager.createPostSa(
        httpServer,
        correctBlogId,
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      expect(result.body).toEqual(
        postsResponsesTestManager.createResponseSinglePostSa(
          correctTitle,
          correctShortDescription,
          correctPostContent,
          correctBlogId,
        ),
      );
    });
  });

  describe(`/blogs/:id/posts (GET) - get all posts of the blog`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken = result.accessToken;

      const blog = await createCorrectBlogTest(httpServer, accessToken);
      correctBlogId = blog.id;
    });

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await postsRequestsTestManager.getAllPostsSa(
        httpServer,
        correctBlogId,
        'incorrectLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await postsRequestsTestManager.getAllPostsSa(
        httpServer,
        correctBlogId,
        null,
        'IncorrectPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) should not return posts because blog is not found`, async () => {
      const result = await postsRequestsTestManager.getAllPostsSa(
        httpServer,
        uuidv4(),
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (200) should return empty array of posts`, async () => {
      const result = await postsRequestsTestManager.getAllPostsSa(
        httpServer,
        correctBlogId,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        blogsResponsesTestManager.createResponseAllBlogsSa([]),
      );
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

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await postsRequestsTestManager.updatePostSa(
        httpServer,
        correctBlogId,
        correctPostId,
        correctTitle,
        correctShortDescription,
        correctPostContent,
        'incorrectLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await postsRequestsTestManager.updatePostSa(
        httpServer,
        correctBlogId,
        correctPostId,
        correctTitle,
        correctShortDescription,
        correctPostContent,
        null,
        'IncorrectPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) should not update post because blog is not found with such id
              - (404) should not update post because post is not found with such id`, async () => {
      //blogId is incorrect
      const result1 = await postsRequestsTestManager.updatePostSa(
        httpServer,
        uuidv4(),
        correctPostId,
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
      //postId is incorrect
      const result2 = await postsRequestsTestManager.updatePostSa(
        httpServer,
        correctBlogId,
        uuidv4(),
        correctTitle,
        correctShortDescription,
        correctPostContent,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`- (400) values of 'title', 'shortDescription' and 'content' are incorrect (large length)
              - (400) values of 'title', 'shortDescription' and 'content' are incorrect (not string)`, async () => {
      const result1 = await postsRequestsTestManager.updatePostSa(
        httpServer,
        correctBlogId,
        correctPostId,
        titleLength31,
        postShortDescriptionLength101,
        postContentLength1001,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(
        createErrorsMessageTest(['title', 'shortDescription', 'content']),
      );

      const result2 = await postsRequestsTestManager.updatePostSa(
        httpServer,
        correctBlogId,
        correctPostId,
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
      const result = await postsRequestsTestManager.updatePostSa(
        httpServer,
        correctBlogId,
        correctPostId,
        'newTitle',
        'newShortDescription',
        'newContent',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check post with updating data
      const post = await getPostByIdPublicTest(httpServer, correctPostId);
      expect(post.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(post.body).toEqual(
        postsResponsesTestManager.createResponseSinglePostSa(
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

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await postsRequestsTestManager.deletePostSa(
        httpServer,
        correctBlogId,
        correctPostId,
        'incorrectLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await postsRequestsTestManager.deletePostSa(
        httpServer,
        correctBlogId,
        correctPostId,
        null,
        'IncorrectPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) should not delete post because blog is not found with such id
              - (404) should not delete post because post is not found with such id`, async () => {
      //blogId is incorrect
      const result1 = await postsRequestsTestManager.deletePostSa(
        httpServer,
        uuidv4(),
        correctPostId,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
      //postId is incorrect
      const result2 = await postsRequestsTestManager.deletePostSa(
        httpServer,
        correctBlogId,
        uuidv4(),
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (204) should delete post`, async () => {
      const result = await postsRequestsTestManager.deletePostSa(
        httpServer,
        correctBlogId,
        correctPostId,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check that post is deleted
      const post = await getPostByIdPublicTest(httpServer, correctPostId);
      expect(post.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });
  });
});
