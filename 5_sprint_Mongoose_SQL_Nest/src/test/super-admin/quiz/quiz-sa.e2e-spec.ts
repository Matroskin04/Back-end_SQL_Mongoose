import { INestApplication } from '@nestjs/common';
import { startApp } from '../../test.utils';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import { createBlogSaTest } from '../blogs/blogs-sa.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { createQuestionQuizSaTest } from './quiz-sa.helpers';
import { createErrorsMessageTest } from '../../helpers/errors-message.helper';

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

  //incorrectData question
  const bodyLength9 = 'a'.repeat(9);
  const bodyLength501 = 'a'.repeat(501);

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

    it(`- (400) incorrect body (too large length) and correctAnswers (should be an array)
              - (400) incorrect body (too small length) and correctAnswers (array should be filled by strings)
              - (400) incorrect body (should be a string) and correctAnswers (length should be > 0)
              - (400) incorrect body (the length should not be less 10 after trim)`, async () => {
      //body length, answers not array
      const result1 = await createQuestionQuizSaTest(
        httpServer,
        bodyLength501,
        'not an array',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(
        createErrorsMessageTest(['body', 'correctAnswers']),
      );
      //body length, answers array contains not a string
      const result2 = await createQuestionQuizSaTest(httpServer, bodyLength9, [
        '123',
        123,
      ]);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(
        createErrorsMessageTest(['body', 'correctAnswers']),
      );
      //body is not a string, length of array < 1
      const result3 = await createQuestionQuizSaTest(httpServer, 123, []);
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result3.body).toEqual(
        createErrorsMessageTest(['body', 'correctAnswers']),
      );
      //body length is less than 10 after trim
      const result4 = await createQuestionQuizSaTest(
        httpServer,
        '              ',
        ['correct'],
      );
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result4.body).toEqual(createErrorsMessageTest(['body']));
    });
  });
});
