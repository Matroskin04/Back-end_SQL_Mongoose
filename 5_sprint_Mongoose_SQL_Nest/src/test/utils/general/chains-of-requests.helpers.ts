import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { loginUserTest } from '../../public/auth/auth-public.helpers';
import {
  CreateCorrectBlogTestType,
  CreateCorrectPostTestType,
  CreateCorrectUserTestType,
  LoginCorrectUserTestType,
} from '../../types/chains-of-requests.types';
import { usersRequestsTestManager } from '../users/users-requests-test.manager';
import { blogsRequestsTestManager } from '../blogs/blogs-requests-test.manager';
import { postsRequestsTestManager } from '../post/posts-requests-test.manager';

export async function createCorrectUserTest(
  httpServer,
): Promise<CreateCorrectUserTestType> {
  const user = await usersRequestsTestManager.createUserSa(
    httpServer,
    'correct',
    'correctPass',
    'correctEmail@gmail.com',
  );
  expect(user.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

  return {
    id: user.body.id,
    login: 'correct',
    password: 'correctPass',
    email: 'correctEmail@gmail.com',
  };
}

export async function loginCorrectUserTest(
  httpServer,
): Promise<LoginCorrectUserTestType> {
  const result = await loginUserTest(httpServer, 'correct', 'correctPass');
  expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
  const accessToken = result.body.accessToken;
  const refreshToken = result.headers['set-cookie'][0];

  return {
    accessToken,
    refreshToken,
  };
}

export async function createCorrectBlogTest(
  httpServer,
  accessToken,
): Promise<CreateCorrectBlogTestType> {
  const blog = await blogsRequestsTestManager.createBlogBlogger(
    httpServer,
    accessToken,
    'correctName',
    'correctDescription',
    'https://SoBqgeyargbRK5jx76KYc6XS3qU9LWMJCvbDif9VXOiplGf4-RK0nhw34lvql.zgG73ki0po16f.J4U96ZRvoH3VE_WK',
  );
  expect(blog.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

  return {
    id: blog.body.id,
    name: 'correctName',
    description: 'correctDescription',
    websiteUrl:
      'https://SoBqgeyargbRK5jx76KYc6XS3qU9LWMJCvbDif9VXOiplGf4-RK0nhw34lvql.zgG73ki0po16f.J4U96ZRvoH3VE_WK',
  };
}

export async function createCorrectPostTest(
  httpServer,
  blogId,
  accessToken,
): Promise<CreateCorrectPostTestType> {
  const post = await postsRequestsTestManager.createPostBlogger(
    httpServer,
    blogId,
    accessToken,
    'correctTitle',
    'correctShortDescription',
    'correctContent',
  );
  expect(post.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

  return {
    id: post.body.id,
    title: 'correctTitle',
    shortDescription: 'correctShortDescription',
    content: 'correctContent',
  };
}
