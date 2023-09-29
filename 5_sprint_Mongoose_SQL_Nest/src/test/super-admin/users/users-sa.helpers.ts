import request from 'supertest';
import { createBlogTest } from '../../blogger/blogs/blogs-blogger.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';

export async function createUserTest(
  httpServer,
  login: string,
  password: string,
  email: string,
  saLogin?,
  saPass?,
) {
  return request(httpServer)
    .post(`/hometask-nest/sa/users`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
    .send({ login, password, email });
}

export async function getUsersSaTest(httpServer, query?, saLogin?, saPass?) {
  return request(httpServer)
    .get(`/hometask-nest/sa/users`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
    .query(query ?? '');
}

export async function deleteUserSaTest(httpServer, userId, saLogin?, saPass?) {
  return request(httpServer)
    .delete(`/hometask-nest/sa/users/${userId}`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty');
}

export function createResponseSingleUserTest(login?, email?) {
  return {
    id: expect.any(String),
    login: login ?? expect.any(String),
    email: email ?? expect.any(String),
    createdAt: expect.any(String),
  };
}

export async function create9UsersSaTest(httpServer) {
  const userNumber = [
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
  const usersIds: any = [];
  let count = 1;
  for (const i of userNumber) {
    const result = await createUserTest(
      httpServer,
      `L${count}${i}`,
      `correctPass1`,
      `email${count}${i}@gmail.com`,
    );
    expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
    usersIds.push(result.body.id);
    count++;
  }
  return usersIds.reverse();
}

export function createResponseUsersSaTest(
  idsOfUsers: Array<string> | number,
  totalCount?: number,
  pagesCount?: number,
  page?: number,
  pageSize?: number,
) {
  const allUsers: any = [];
  const limit = typeof idsOfUsers === 'number' ? idsOfUsers : idsOfUsers.length;

  for (let i = 0; i < limit; i++) {
    allUsers.push({
      id: idsOfUsers[i] ?? expect.any(String),
      login: expect.any(String),
      email: expect.any(String),
      createdAt: expect.any(String),
    });
  }
  return {
    pagesCount: pagesCount ?? 1,
    page: page ?? 1,
    pageSize: pageSize ?? 10,
    totalCount: totalCount ?? 0,
    items: allUsers,
  };
}
