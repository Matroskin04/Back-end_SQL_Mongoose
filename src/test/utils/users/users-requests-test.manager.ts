import request from 'supertest';
import { RouterPaths } from '../router-paths';
import { QuestionQuiz } from '../../../features/quiz/domain/question-quiz.entity';
import { QuestionTestType } from '../../super-admin/quiz/quiz-sa.types';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';

export const usersRequestsTestManager = {
  getUsersSa: async function (httpServer, query?, saLogin?, saPass?) {
    return request(httpServer)
      .get(RouterPaths.usersSa)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
      .query(query ?? '');
  },

  createUserSa: async function (
    httpServer,
    login: string,
    password: string,
    email: string,
    saLogin?,
    saPass?,
  ) {
    return request(httpServer)
      .post(RouterPaths.usersSa)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
      .send({ login, password, email });
  },

  create9UsersSa: async function (httpServer) {
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
      const result = await this.createUserSa(
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
  },

  deleteUserSa: async function (httpServer, userId, saLogin?, saPass?) {
    return request(httpServer)
      .delete(RouterPaths.usersSa + `/${userId}`)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty');
  },
};
