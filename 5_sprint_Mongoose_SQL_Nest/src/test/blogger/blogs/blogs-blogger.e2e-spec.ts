import { INestApplication } from '@nestjs/common';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { loginUserTest } from '../../public/auth/auth-public.helpers';
import { v4 as uuidv4 } from 'uuid';
import { createErrorsMessageTest } from '../../utils/general/errors-message.helper';
import { getPostByIdPublicTest } from '../../public/posts/posts-public.helpers';
import {
  getAllBlogsPublicTest,
  getBlogByIdPublicTest,
} from '../../public/blogs/blogs-public.helpers';
import { deleteAllDataTest } from '../../utils/general/delete-all-data.helper';
import {
  createCorrectBlogTest,
  createCorrectPostTest,
  createCorrectUserTest,
  loginCorrectUserTest,
} from '../../utils/general/chains-of-requests.helpers';
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
import { commentsRequestsTestManager } from '../../utils/comments/comments-requests-test.manager';

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
    let blogsIds;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken = result.accessToken;

      blogsIds = await blogsRequestsTestManager.create9BlogsBlogger(
        httpServer,
        accessToken,
      );
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        'IncorrectJWT',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) should return 9 blogs`, async () => {
      const result = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        accessToken,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        blogsResponsesTestManager.createResponseAllBlogsBlogger(
          blogsIds,
          null,
          9,
          1,
          1,
          10,
        ),
      );
    });

    it(`+ (200) should return 0 blogs (no blogs with such name term) `, async () => {
      const result = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        accessToken,
        'searchNameTerm=qwertyuio1234568',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        blogsResponsesTestManager.createResponseAllBlogsBlogger(
          [],
          null,
          0,
          1,
          1,
          10,
        ),
      );
    });

    it(`+ (200) should return 3 blogs (query: pageSize=3, pageNumber=2)
              + (200) should return 4 blogs (query: pageSize=5, pageNumber=2)`, async () => {
      //3 blogs
      const result1 = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        accessToken,
        'pageSize=3&&pageNumber=2',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        blogsResponsesTestManager.createResponseAllBlogsBlogger(
          blogsIds.slice(3, 6),
          null,
          9,
          3,
          2,
          3,
        ),
      );

      //4 blogs
      const result2 = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        accessToken,
        'pageSize=5&&pageNumber=2',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        blogsResponsesTestManager.createResponseAllBlogsBlogger(
          blogsIds.slice(5),
          null,
          9,
          2,
          2,
          5,
        ),
      );
    });

    it(`+ (200) should return 9 blogs (query: sortBy=name&&pageSize=5)
              + (200) should return 9 blogs (query: sortDirection=asc)
              + (200) should return 9 blogs (query: sortBy=id&&sortDirection=desc)`, async () => {
      const blogsIdsCopy = [...blogsIds];
      //sortBy=name, 9 blogs
      const result1 = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        accessToken,
        'sortBy=name&&pageSize=5',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        blogsResponsesTestManager.createResponseAllBlogsBlogger(
          blogsIdsCopy.slice(0, 5),
          null,
          9,
          2,
          1,
          5,
        ),
      );

      //sortDirection=asc, 9 blogs
      const result2 = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        accessToken,
        'sortDirection=asc',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        blogsResponsesTestManager.createResponseAllBlogsBlogger(
          blogsIdsCopy.reverse(),
          null,
          9,
          1,
          1,
          10,
        ),
      );

      //sortBy=id&&sortDirection=desc, 9 blogs
      const result3 = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        accessToken,
        'sortBy=id&&sortDirection=desc',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        blogsResponsesTestManager.createResponseAllBlogsBlogger(
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
      const result1 = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        accessToken,
        'searchNameTerm=irs',
      );

      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        blogsResponsesTestManager.createResponseAllBlogsBlogger(
          [blogsIds[8]],
          null,
          1,
          1,
          1,
          10,
        ),
      );

      //searchNameTerm=TH, 7 blogs
      const result2 = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        accessToken,
        'searchNameTerm=TH',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        blogsResponsesTestManager.createResponseAllBlogsBlogger(
          blogsIds.slice(0, 7),
          null,
          7,
          1,
          1,
          10,
        ),
      );

      //searchNameTerm=S, 4 blogs
      const result3 = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        accessToken,
        'searchNameTerm=S',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        blogsResponsesTestManager.createResponseAllBlogsBlogger(
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
      const result1 = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        accessToken,
        'sortBy=Truncate;',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['sortBy']));

      //status 400
      const result2 = await blogsRequestsTestManager.getAllBlogsBlogger(
        httpServer,
        accessToken,
        'sortDirection=Truncate;',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['sortDirection']));
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

  describe(`/blogs/comments (GET) - get all comments of a blogger
                  (Addition) /blogs, /blogs/:id/posts (POST) - create addition blog and 2 posts for blog 1 and 2
                  (Addition) /posts/:id/comments (POST) -  should create 6 comments by 3 users`, () => {
    const accessTokens: string[] = [];
    let accessToken1;
    let accessToken2;
    let accessToken3;

    const blogsIds: string[] = [];
    const postsIds: string[] = [];
    const commentsIds: string[] = [];

    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //blogger
      user = await createCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      accessToken = result1.accessToken;
      accessTokens.push(accessToken);

      //2 another user
      await usersRequestsTestManager.createUserSa(
        httpServer,
        'login2',
        'password2',
        'email2@mail.ru',
      );
      const result2 = await loginUserTest(httpServer, 'login2', 'password2');
      accessToken2 = result2.body.accessToken;
      accessTokens.push(accessToken2);
      await usersRequestsTestManager.createUserSa(
        httpServer,
        'login3',
        'password3',
        'email3@mail.ru',
      );
      const result3 = await loginUserTest(httpServer, 'login3', 'password3');
      accessToken3 = result3.body.accessToken;
      accessTokens.push(accessToken3);

      //create 3 blogs by 1 user
      for (let i = 0; i < 3; i++) {
        const result = await blogsRequestsTestManager.createBlogBlogger(
          httpServer,
          accessToken,
        );
        expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
        blogsIds.push(result.body.id);
      }

      //create 9 posts of 3 blogs
      for (let i = 0; i < 9; i++) {
        const result = await postsRequestsTestManager.createPostBlogger(
          httpServer,
          blogsIds[Math.floor(i / 3)],
          accessToken,
        );
        expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
        postsIds.push(result.body.id);
      }

      //create 9 comments of 9 posts by 3 different users
      for (let i = 0; i < 9; i++) {
        const result = await createCommentTest(
          httpServer,
          postsIds[i],
          accessTokens[Math.floor(i / 3)],
        );
        expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
        commentsIds.push(result.body.id);
      }
      //sort by desc:
      commentsIds.reverse();
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await commentsRequestsTestManager.getAllCommentsOfBlogger(
        httpServer,
        'IncorrectJWT',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) should return array of 9 comments`, async () => {
      //getAllComments
      const result = await commentsRequestsTestManager.getAllCommentsOfBlogger(
        httpServer,
        accessToken,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseCommentsOfBlogger(commentsIds, 9),
      );
    });
  });
});
