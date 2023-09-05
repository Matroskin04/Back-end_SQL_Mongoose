import request from 'supertest';
import { createBlogTest } from '../../blogger/blogs/blogs-blogger.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { createUserTest } from '../../super-admin/users-sa.helpers';
import { loginUserTest } from '../auth/auth-public.helpers';
import { AccessTokensAndUsersIdType } from '../types/blogs.types';

export async function getBlogByIdPublicTest(httpServer, blogId) {
  return request(httpServer).get(`/hometask-nest/blogs/${blogId}`);
}

export async function getAllBlogsPublicTest(httpServer) {
  return request(httpServer).get(`/hometask-nest/blogs`);
}

export async function create9BlogsBy3Users(
  httpServer,
  accessTokens: string[],
): Promise<string[]> {
  const blogNumber = [
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'sixth',
    'seventh',
    'eighth',
    'ninth',
  ];
  const blogsIds: any = [];
  for (const i of blogNumber) {
    const result = await createBlogTest(
      httpServer,
      accessTokens[0],
      `Name ${i}`,
      `Description ${i}`,
      `https://samurai.it-incubator.io`,
    );
    expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
    blogsIds.push(result.body.id);
  }
  return blogsIds;
}

export async function createAndLogin3UsersTest(
  httpServer,
): Promise<AccessTokensAndUsersIdType> {
  //user1
  const user1 = await createUserTest(
    httpServer,
    'Login1',
    'Password1',
    'email1@mail.ru',
  );
  expect(user1.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
  const result1 = await loginUserTest(httpServer, 'Login1', 'Password1');
  expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
  const accessToken1 = result1.body.accessToken;

  //user2
  const user2 = await createUserTest(
    httpServer,
    'Login2',
    'Password2',
    'email2@mail.ru',
  );
  expect(user2.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
  const result2 = await loginUserTest(httpServer, 'Login2', 'Password2');
  expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
  const accessToken2 = result2.body.accessToken;

  //user3
  const user3 = await createUserTest(
    httpServer,
    'Login3',
    'Password3',
    'email3@mail.ru',
  );
  expect(user3.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
  const result3 = await loginUserTest(httpServer, 'Login3', 'Password3');
  expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
  const accessToken3 = result3.body.accessToken;

  return [
    { accessToken: accessToken1, userId: user1.body.id },
    { accessToken: accessToken2, userId: user2.body.id },
    { accessToken: accessToken3, userId: user3.body.id },
  ];
}
