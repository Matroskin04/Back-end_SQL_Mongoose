import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { startApp } from '../../test.utils';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import {
  create9Questions,
  createResponseAllQuestionsTest,
  getAllQuestions,
  publishQuestionSaTest,
} from '../../super-admin/quiz/quiz-sa.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { createErrorsMessageTest } from '../../helpers/errors-message.helper';
import { updateStatusLikeOfPostTest } from '../posts/posts-public.helpers';
import {
  connectPlayerToQuiz,
  createResponseSingleQuizTest,
} from './quiz-public.helpers';
import {
  createCorrectUserTest,
  loginCorrectUserTest,
} from '../../helpers/chains-of-requests.helpers';

describe('Quiz (SA); /sa/quiz', () => {
  jest.setTimeout(5 * 60 * 1000);

  //vars for starting app and testing
  let app: INestApplication;
  let httpServer;
  let dataSource: DataSource;

  beforeAll(async () => {
    const info = await startApp();
    app = info.app;
    httpServer = info.httpServer;

    dataSource = await app.resolve(DataSource);
  });

  afterAll(async () => {
    await httpServer.close();
    await app.close();
  });

  let accessToken;
  let user;
  //correct data question
  let correctQuestionId;
  let questionData;
  const correctBody = 'Solve: 3 + 3 = ?';
  const correctAnswers = ['6', 'шесть', 'six'];
  //incorrectData question
  const bodyLength9 = 'a'.repeat(9);
  const bodyLength501 = 'a'.repeat(501);

  describe(`/questions (GET) - get all questions`, () => {
    let questionsIds;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken = result.accessToken;

      //create 9 questions
      questionsIds = await create9Questions(httpServer);
      //publish them:
      for (const id of questionsIds) {
        await publishQuestionSaTest(httpServer, id, true);
      }
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await connectPlayerToQuiz(httpServer, 'IncorrectJWT');
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) user should create new quiz`, async () => {
      const result = await connectPlayerToQuiz(httpServer, accessToken);
      console.log(result.body);

      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseSingleQuizTest(
          'PendingSecondPlayer',
          null,
          user.id,
          0,
          null,
          null,
        ),
      );
    });
  });
});
