import { INestApplication } from '@nestjs/common';
import { startApp } from '../../test.utils';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import { createBlogSaTest } from '../blogs/blogs-sa.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { createQuestionQuizSaTest } from './quiz-sa.helpers';

describe('Quiz (SA); /sa/quiz', () => {
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

  describe(`/questions (POST) - create new question`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);
    });

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await createQuestionQuizSaTest(
        httpServer,
        null,
        null,
        'incorrectLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await createQuestionQuizSaTest(
        httpServer,
        null,
        null,
        null,
        'IncorrectPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });
  });
});
