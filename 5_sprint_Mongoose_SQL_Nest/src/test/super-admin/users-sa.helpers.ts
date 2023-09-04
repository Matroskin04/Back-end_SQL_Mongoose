import request from 'supertest';

export async function createUserTest(
  httpServer,
  login: string,
  password: string,
  email: string,
) {
  return request(httpServer)
    .post(`/hometask-nest/sa/users`)
    .auth('admin', 'qwerty')
    .send({ login, password, email });
}
