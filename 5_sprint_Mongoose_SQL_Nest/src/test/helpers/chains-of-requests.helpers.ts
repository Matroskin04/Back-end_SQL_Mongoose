import { createUserTest } from '../super-admin/users-sa.helpers';
import { HTTP_STATUS_CODE } from '../../infrastructure/utils/enums/http-status';
import { loginUserTest } from '../public/auth/auth-public.helpers';
import { createBlogTest } from '../blogger/blogs/blogs-blogger.helpers';
import { createPostTest } from '../blogger/blogs/posts-blogger.helpers';
import {
  CreateCorrectBlogTestType,
  CreateCorrectPostTestType,
  CreateCorrectUserTestType,
  LoginCorrectUserTestType,
} from './types/chains-of-requests.types';

export async function createCorrectUserTest(
  httpServer,
): Promise<CreateCorrectUserTestType> {
  const user = await createUserTest(
    httpServer,
    'correct',
    'correctPass',
    'correctEmail@gmail.com',
  );
  expect(user.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

  return {
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
  const blog = await createBlogTest(
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
  const post = await createPostTest(
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
