import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { startApp } from '../../test.utils';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import {
  create9Questions,
  publishQuestionSaTest,
} from '../../super-admin/quiz/quiz-sa.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import {
  connectPlayerToQuizTest,
  createResponseAnswerTest,
  createResponseSingleQuizTest,
  getMyCurrentQuizTest,
  getQuizByIdTest,
  sendAnswerTest,
} from './quiz-public.helpers';
import { v4 as uuidv4 } from 'uuid';
import {
  createCorrectUserTest,
  loginCorrectUserTest,
} from '../../helpers/chains-of-requests.helpers';
import { createUserTest } from '../../super-admin/users/users-sa.helpers';
import { loginUserTest } from '../auth/auth-public.helpers';
import { createErrorsMessageTest } from '../../helpers/errors-message.helper';
import { ht } from 'date-fns/locale';

describe('Quiz (PUBLIC); /pair-game-quiz/pairs', () => {
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

  let accessToken1;
  let accessToken2;
  let user1;
  let user2;

  let questionsIds;

  const incorrectAnswer = 'answer';
  const correctAnswer = 'correctAnswer';
  //correct data question
  let correctQuestionId;
  let questionData;
  const correctBody = 'Solve: 3 + 3 = ?';
  const correctAnswers = ['6', 'шесть', 'six'];
  //incorrectData question
  const bodyLength9 = 'a'.repeat(9);
  const bodyLength501 = 'a'.repeat(501);

  describe(`/my-current (GET) - get current quiz game of a user`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user1 = await createCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      accessToken1 = result1.accessToken;

      user2 = await createUserTest(
        httpServer,
        'login2',
        'password2',
        'email2@mail.ru',
      );
      const result2 = await loginUserTest(httpServer, 'login2', 'password2');
      accessToken2 = result2.body.accessToken;

      //create 9 questions
      questionsIds = await create9Questions(httpServer);
      //publish them:
      for (const id of questionsIds) {
        await publishQuestionSaTest(httpServer, id, true);
      }
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await getMyCurrentQuizTest(httpServer, 'IncorrectJWT');
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) no active pair for current user`, async () => {
      //jwt is incorrect
      const result = await getMyCurrentQuizTest(httpServer, accessToken1);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`(Additional) + (200) should connect user1 to new quiz;
              + (200) should return current game of user;
              (Additional) + (200) should connect user2 to the quiz;
              + (200) should return current game of user;`, async () => {
      //connect to new quiz
      const result1 = await connectPlayerToQuizTest(httpServer, accessToken1);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      //get current quiz
      const result2 = await getMyCurrentQuizTest(httpServer, accessToken1);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseSingleQuizTest(
          'PendingSecondPlayer',
          null,
          null,
          user1.id,
          0,
          null,
        ),
      );

      //connect user2 to the quiz
      const result3 = await connectPlayerToQuizTest(httpServer, accessToken2);
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      //get current quiz
      const result4 = await getMyCurrentQuizTest(httpServer, accessToken1);
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result4.body).toEqual(
        createResponseSingleQuizTest(
          'Active',
          '5questions',
          null,
          user1.id,
          0,
          user2.body.id,
          user2.body.login,
          0,
          'string',
        ),
      );
    });
  });

  describe(`/:quizId (GET) - get a quiz game by id`, () => {
    let quizId;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user1 = await createCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      accessToken1 = result1.accessToken;

      user2 = await createUserTest(
        httpServer,
        'login2',
        'password2',
        'email2@mail.ru',
      );
      const result2 = await loginUserTest(httpServer, 'login2', 'password2');
      accessToken2 = result2.body.accessToken;

      //create 9 questions
      questionsIds = await create9Questions(httpServer);
      //publish them:
      for (const id of questionsIds) {
        await publishQuestionSaTest(httpServer, id, true);
      }

      //connect to new quiz
      const result3 = await connectPlayerToQuizTest(httpServer, accessToken1);
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      quizId = result3.body.id;
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await getQuizByIdTest(httpServer, quizId, 'IncorrectJWT');
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) quiz with such id was not found`, async () => {
      //jwt is incorrect
      const result = await getQuizByIdTest(httpServer, uuidv4(), accessToken1);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`- (400) id has invalid format`, async () => {
      //jwt is incorrect
      const result = await getQuizByIdTest(
        httpServer,
        'incorrect format',
        accessToken1,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result.body).toEqual(createErrorsMessageTest(['quizId']));
    });

    it(`(Addition) + (201) create and login new user
              - (403) the user does not participate is this quiz`, async () => {
      await createUserTest(httpServer, 'login3', 'password3', 'email3@mail.ru');
      const logInfo = await loginUserTest(httpServer, 'login3', 'password3');
      const accessToken3 = logInfo.body.accessToken;
      //jwt is incorrect
      const result = await getQuizByIdTest(httpServer, quizId, accessToken3);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);
    });

    it(`+ (200) should return current game of user;
              (Additional) + (200) should connect user2 to the quiz;
              + (200) should return current game of user;`, async () => {
      //get current quiz
      const result1 = await getQuizByIdTest(httpServer, quizId, accessToken1);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseSingleQuizTest(
          'PendingSecondPlayer',
          null,
          null,
          user1.id,
          0,
          null,
          null,
        ),
      );

      //connect user2 to the quiz
      const result2 = await connectPlayerToQuizTest(httpServer, accessToken2);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      //get current quiz
      const result3 = await getQuizByIdTest(httpServer, quizId, accessToken1);
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        createResponseSingleQuizTest(
          'Active',
          '5questions',
          null,
          user1.id,
          0,
          user2.body.id,
          user2.body.login,
          0,
          'string',
        ),
      );
    });
  });

  describe(`/connection (POST) - connect user to existing quiz or create new`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user1 = await createCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      accessToken1 = result1.accessToken;

      user2 = await createUserTest(
        httpServer,
        'login2',
        'password2',
        'email2@mail.ru',
      );
      const result2 = await loginUserTest(httpServer, 'login2', 'password2');
      accessToken2 = result2.body.accessToken;

      //create 9 questions
      questionsIds = await create9Questions(httpServer);
      //publish them:
      for (const id of questionsIds) {
        await publishQuestionSaTest(httpServer, id, true);
      }
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await connectPlayerToQuizTest(httpServer, 'IncorrectJWT');
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) user 1 should create new quiz;
              - (403) user1 is already participating in active quiz;
              + (200) user 2 should connect to quiz`, async () => {
      const result1 = await connectPlayerToQuizTest(httpServer, accessToken1);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseSingleQuizTest(
          'PendingSecondPlayer',
          null,
          null,
          user1.id,
          0,
          null,
          null,
        ),
      );

      //user is already in active (pending) game
      const result2 = await connectPlayerToQuizTest(httpServer, accessToken1);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);

      const result3 = await connectPlayerToQuizTest(httpServer, accessToken2);
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        createResponseSingleQuizTest(
          'Active',
          '5questions',
          null,
          user1.id,
          0,
          user2.body.id,
          user2.body.login,
          0,
          'string',
        ),
      );
    });

    //DEPENDENT
    it(`- (403) user1 is already participating in active quiz
              - (403) user2 is already participating in active quiz`, async () => {
      //user1
      const result1 = await connectPlayerToQuizTest(httpServer, accessToken1);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);

      //user2
      const result2 = await connectPlayerToQuizTest(httpServer, accessToken2);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);
    });
  });

  describe(`/my-current/answers (POST) - send answer to question`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user1 = await createCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      accessToken1 = result1.accessToken;

      user2 = await createUserTest(
        httpServer,
        'login2',
        'password2',
        'email2@mail.ru',
      );
      const result2 = await loginUserTest(httpServer, 'login2', 'password2');
      accessToken2 = result2.body.accessToken;

      //create 9 questions
      questionsIds = await create9Questions(httpServer);
      //publish them:
      for (const id of questionsIds) {
        await publishQuestionSaTest(httpServer, id, true);
      }
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await sendAnswerTest(
        httpServer,
        'IncorrectJWT',
        correctAnswer,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (403) user has not an active quiz game
              (Addition) + (200) user 1 should create new quiz;
              - (403) user has not an active quiz game`, async () => {
      //no active game
      const result1 = await sendAnswerTest(
        httpServer,
        accessToken1,
        correctAnswer,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);

      //create new quiz
      const result2 = await connectPlayerToQuizTest(httpServer, accessToken1);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

      //no active game (only in status pending)
      const result3 = await sendAnswerTest(
        httpServer,
        accessToken1,
        correctAnswer,
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);
    });

    //DEPENDENT
    it(`(Addition) + (200) user 2 should connect to quiz;
              + (200) user 1 should send 3 correct answer;
              + (200) should return quiz by id;
              + (200) user 2 should send 2 correct answer;
              + (200) should return quiz by id;`, async () => {
      //user 2 connect to quiz
      const result1 = await connectPlayerToQuizTest(httpServer, accessToken2);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

      for (let i = 0; i < 5; i++) {
        const answer = i % 2 === 0 ? correctAnswer : incorrectAnswer;
        const answerStatus = i % 2 === 0 ? 'Correct' : 'Incorrect';
        //3 correct answers
        const result = await sendAnswerTest(httpServer, accessToken1, answer);
        expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        expect(result.body).toEqual(
          createResponseAnswerTest(null, answerStatus),
        );
      }

      const quizResult1 = await getQuizByIdTest(
        httpServer,
        result1.body.id,
        accessToken1,
      );
      expect(quizResult1.body).toEqual(
        createResponseSingleQuizTest(
          'Active',
          '5questions',
          null,
          user1.id,
          3,
          user2.body.id,
          user2.body.login,
          0,
          'string',
          'string',
        ),
      );
      expect(
        quizResult1.body.firstPlayerProgress.answers.filter(
          (a) => a.answerStatus === 'Correct',
        ).length,
      ).toBe(3);

      for (let i = 0; i < 5; i++) {
        const answer = i % 2 === 0 ? incorrectAnswer : correctAnswer;
        const answerStatus = i % 2 === 0 ? 'Incorrect' : 'Correct';
        //2 correct answers
        const result = await sendAnswerTest(httpServer, accessToken2, answer);
        expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        expect(result.body).toEqual(
          createResponseAnswerTest(null, answerStatus),
        );
      }
      const quizResult2 = await getQuizByIdTest(
        httpServer,
        result1.body.id,
        accessToken1,
      );
      expect(quizResult2.body).toEqual(
        createResponseSingleQuizTest(
          'Finished',
          '5questions',
          null,
          user1.id,
          4,
          user2.body.id,
          user2.body.login,
          2,
          'string',
          'string',
          'string',
          'string',
        ),
      );
    });
  });
});
