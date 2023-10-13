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
  addAnswersToQuizTest,
  connectPlayerToQuizTest,
  createResponseAllStatisticTest,
  createResponseSingleQuizTest,
  createResponseStatisticTest,
  getAllQuizzesTest,
  getMyCurrentQuizTest,
  getMyStatisticTest,
  getQuizByIdTest,
  getStatisticOfAllUsers,
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

describe('Quiz (PUBLIC); /pair-game-quiz', () => {
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
  let accessToken3;
  let accessToken4;
  let user1;
  let user2;
  let user3;
  let user4;

  let questionsIds;
  let quizId;

  const correctAnswer = 'correctAnswer';

  describe(`/pairs/my-current (GET) - get current quiz game of a user`, () => {
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

  describe(`/pairs/:quizId (GET) - get a quiz game by id`, () => {
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

  describe(`/pairs/my (GET) - get all quizzes of user`, () => {
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
      //create 3 finished games and 1 pending
      //score1: 4, score2: 4, draw
      {
        // DRAW
        //connect to new quiz
        const result1 = await connectPlayerToQuizTest(httpServer, accessToken1);
        expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        //connect user2 to the quiz
        const result2 = await connectPlayerToQuizTest(httpServer, accessToken2);
        expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

        //3 correct answers by user1 (3+1 score)
        await addAnswersToQuizTest(httpServer, accessToken1, 3);

        //check that active game is not shown in statistic
        const statistic = await getMyStatisticTest(httpServer, accessToken1);
        expect(statistic.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        expect(statistic.body).toEqual(createResponseStatisticTest());

        //4 correct answers by user2 (4 score)
        await addAnswersToQuizTest(httpServer, accessToken2, 4);
      }
      //score1: 3, score2: 0, winner: user1
      {
        //WINNER: USER1
        //connect to new quiz
        const result1 = await connectPlayerToQuizTest(httpServer, accessToken2);
        expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        //connect user2 to the quiz
        const result2 = await connectPlayerToQuizTest(httpServer, accessToken1);
        expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

        //0 correct answers by user2 (0 score)
        await addAnswersToQuizTest(httpServer, accessToken2, 0);
        //3 correct answers by user1 (3 score)
        await addAnswersToQuizTest(httpServer, accessToken1, 3);
      }
      //score1: 3, score2: 4, winner: user2
      {
        //WINNER: USER2
        //connect to new quiz
        const result1 = await connectPlayerToQuizTest(httpServer, accessToken1);
        expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        //connect user2 to the quiz
        const result2 = await connectPlayerToQuizTest(httpServer, accessToken2);
        expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

        //2 correct answers by user1 (2+1 score)
        await addAnswersToQuizTest(httpServer, accessToken1, 2);
        //5 correct answers by user2 (5 score)
        await addAnswersToQuizTest(httpServer, accessToken2, 4);
      }
      //pending
      {
        const result = await connectPlayerToQuizTest(httpServer, accessToken1);
        expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      }
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await getAllQuizzesTest(httpServer, 'IncorrectJWT');
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) should return all quizzes of user`, async () => {
      //get all quizzes
      const result1 = await getAllQuizzesTest(
        httpServer,
        accessToken1,
        'sortBy=finishGameDate',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body.pagesCount).toEqual(1);
      expect(result1.body.page).toEqual(1);
      expect(result1.body.pageSize).toEqual(10);
      expect(result1.body.totalCount).toEqual(4);
      expect(result1.body.items.length).toBe(4);

      const result2 = await getAllQuizzesTest(
        httpServer,
        accessToken1,
        'sortBy=finishGameDate&sortDirection=asc',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body.items.length).toBe(4);
      expect(result2.body.items.map((quiz) => quiz.id)).toEqual(
        result1.body.items.map((quiz) => quiz.id).reverse(),
      );
    });
  });

  describe(`/users/my-statistic (GET) - get current user statistic`, () => {
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

    it(`+ (200) should return current game of user1 (all = 0);`, async () => {
      const result = await getMyStatisticTest(httpServer, accessToken1);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(createResponseStatisticTest());
    });

    //Addition, preparation
    it(`(Additional) + finish 3 quiz
              + (200) should return current game of user1 (all = 0);`, async () => {
      //score1: 4, score2: 4, draw
      {
        // DRAW
        //connect to new quiz
        const result1 = await connectPlayerToQuizTest(httpServer, accessToken1);
        expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        //connect user2 to the quiz
        const result2 = await connectPlayerToQuizTest(httpServer, accessToken2);
        expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

        //3 correct answers by user1 (3+1 score)
        await addAnswersToQuizTest(httpServer, accessToken1, 3);

        //check that active game is not shown in statistic
        const statistic = await getMyStatisticTest(httpServer, accessToken1);
        expect(statistic.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        expect(statistic.body).toEqual(createResponseStatisticTest());

        //4 correct answers by user2 (4 score)
        await addAnswersToQuizTest(httpServer, accessToken2, 4);
      }
      //score1: 3, score2: 0, winner: user1
      {
        //WINNER: USER1
        //connect to new quiz
        const result1 = await connectPlayerToQuizTest(httpServer, accessToken2);
        expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        //connect user2 to the quiz
        const result2 = await connectPlayerToQuizTest(httpServer, accessToken1);
        expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

        //0 correct answers by user2 (0 score)
        await addAnswersToQuizTest(httpServer, accessToken2, 0);
        //3 correct answers by user1 (3 score)
        await addAnswersToQuizTest(httpServer, accessToken1, 3);
      }
      //score1: 3, score2: 4, winner: user2
      {
        //WINNER: USER2
        //connect to new quiz
        const result1 = await connectPlayerToQuizTest(httpServer, accessToken1);
        expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        //connect user2 to the quiz
        const result2 = await connectPlayerToQuizTest(httpServer, accessToken2);
        expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

        //2 correct answers by user1 (2+1 score)
        await addAnswersToQuizTest(httpServer, accessToken1, 2);
        //5 correct answers by user2 (5 score)
        await addAnswersToQuizTest(httpServer, accessToken2, 4);
      }
    });

    //DEPENDENT
    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await getMyStatisticTest(httpServer, 'IncorrectJWT');
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    //DEPENDENT
    it(`+ (200) should return current game of user1;
              + (200) should return current game of user2;`, async () => {
      const result1 = await getMyStatisticTest(httpServer, accessToken1);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseStatisticTest(10, 3.33, 3, 1, 1, 1),
      );

      const result2 = await getMyStatisticTest(httpServer, accessToken2);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseStatisticTest(8, 2.67, 3, 1, 1, 1),
      );
    });
  });

  describe(`/users/top (GET) - get statistic of all users`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);
      //create 4 users
      {
        user1 = await createUserTest(
          httpServer,
          'login1',
          'password1',
          'email1@mail.ru',
        );
        const result1 = await loginUserTest(httpServer, 'login1', 'password1');
        accessToken1 = result1.body.accessToken;

        user2 = await createUserTest(
          httpServer,
          'login2',
          'password2',
          'email2@mail.ru',
        );
        const result2 = await loginUserTest(httpServer, 'login2', 'password2');
        accessToken2 = result2.body.accessToken;

        user3 = await createUserTest(
          httpServer,
          'login3',
          'password3',
          'email3@mail.ru',
        );
        const result3 = await loginUserTest(httpServer, 'login3', 'password3');
        accessToken3 = result3.body.accessToken;

        user4 = await createUserTest(
          httpServer,
          'login4',
          'password4',
          'email4@mail.ru',
        );
        const result4 = await loginUserTest(httpServer, 'login4', 'password4');
        accessToken4 = result4.body.accessToken;
      }

      //create 9 questions
      questionsIds = await create9Questions(httpServer);
      //publish them:
      for (const id of questionsIds) {
        await publishQuestionSaTest(httpServer, id, true);
      }
    });

    //Addition, preparation
    it(`(Additional) + finish 3 quiz by user1 and user2`, async () => {
      //score1: 4, score2: 4, draw
      {
        // DRAW
        //connect to new quiz
        const result1 = await connectPlayerToQuizTest(httpServer, accessToken1);
        expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        //connect user2 to the quiz
        const result2 = await connectPlayerToQuizTest(httpServer, accessToken2);
        expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

        //3 correct answers by user1 (3+1 score)
        await addAnswersToQuizTest(httpServer, accessToken1, 3);

        //check that active game is not shown in statistic
        const statistic = await getMyStatisticTest(httpServer, accessToken1);
        expect(statistic.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        expect(statistic.body).toEqual(createResponseStatisticTest());

        //4 correct answers by user2 (4 score)
        await addAnswersToQuizTest(httpServer, accessToken2, 4);
      }
      //score1: 3, score2: 0, winner: user1
      {
        //WINNER: USER1
        //connect to new quiz
        const result1 = await connectPlayerToQuizTest(httpServer, accessToken2);
        expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        //connect user2 to the quiz
        const result2 = await connectPlayerToQuizTest(httpServer, accessToken1);
        expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

        //0 correct answers by user2 (0 score)
        await addAnswersToQuizTest(httpServer, accessToken2, 0);
        //3 correct answers by user1 (3 score)
        await addAnswersToQuizTest(httpServer, accessToken1, 3);
      }
      //score1: 3, score2: 4, winner: user2
      {
        //WINNER: USER2
        //connect to new quiz
        const result1 = await connectPlayerToQuizTest(httpServer, accessToken1);
        expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        //connect user2 to the quiz
        const result2 = await connectPlayerToQuizTest(httpServer, accessToken2);
        expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

        //2 correct answers by user1 (2+1 score)
        await addAnswersToQuizTest(httpServer, accessToken1, 2);
        //5 correct answers by user2 (5 score)
        await addAnswersToQuizTest(httpServer, accessToken2, 4);
      }
    });
    //Addition, preparation
    it(`(Additional) + finish 3 quiz by user2, user3, user4;`, async () => {
      //score2: 3, score3: 4, winner: user3
      {
        //connect to new quiz
        const result1 = await connectPlayerToQuizTest(httpServer, accessToken2);
        expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        //connect user2 to the quiz
        const result2 = await connectPlayerToQuizTest(httpServer, accessToken3);
        expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

        //2 correct answers by user2 (2+1 score)
        await addAnswersToQuizTest(httpServer, accessToken2, 2);

        //4 correct answers by user3 (4 score)
        await addAnswersToQuizTest(httpServer, accessToken3, 4);
      }
      //score3: 3, score4: 5, winner: user4
      {
        //connect to new quiz
        const result1 = await connectPlayerToQuizTest(httpServer, accessToken4);
        expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        //connect user2 to the quiz
        const result2 = await connectPlayerToQuizTest(httpServer, accessToken3);
        expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

        //2 correct answers by user3 (2+1 score)
        await addAnswersToQuizTest(httpServer, accessToken3, 2);
        //5 correct answers by user4 (5 score)
        await addAnswersToQuizTest(httpServer, accessToken4, 5);
      }
      //score2: 6, score4: 3, winner: user2
      {
        //connect to new quiz
        const result1 = await connectPlayerToQuizTest(httpServer, accessToken2);
        expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
        //connect user2 to the quiz
        const result2 = await connectPlayerToQuizTest(httpServer, accessToken4);
        expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

        //5 correct answers by user2 (5+1 score)
        await addAnswersToQuizTest(httpServer, accessToken2, 5);
        //3 correct answers by user4 (3 score)
        await addAnswersToQuizTest(httpServer, accessToken4, 3);
      }

      //score: 1) 10; 2) 17; 3) 7; 4) 8;
      //gamesCount: 1) 3; 2) 5; 3) 2; 4) 2;
    });

    //DEPENDENT
    it(`+ (200) should return current game of user1;
              + (200) should return current game of user2;`, async () => {
      const result = await getStatisticOfAllUsers(httpServer);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseAllStatisticTest(
          4,
          [user4.body.id, user3.body.id, user2.body.id, user1.body.id],
          [10, 17, 7, 8].reverse(),
          [3.33, 3.4, 3.5, 4].reverse(),
          [3, 5, 2, 2].reverse(),
          [1, 2, 1, 1].reverse(),
          [1, 2, 1, 1].reverse(),
          [1, 1, 0, 0].reverse(),
        ),
      );
    });
  });

  describe(`/pairs/connection (POST) - connect user to existing quiz or create new`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login 4 users
      {
        user1 = await createUserTest(
          httpServer,
          'login1',
          'password1',
          'email1@mail.ru',
        );
        const result1 = await loginUserTest(httpServer, 'login1', 'password1');
        accessToken1 = result1.body.accessToken;

        user2 = await createUserTest(
          httpServer,
          'login2',
          'password2',
          'email2@mail.ru',
        );
        const result2 = await loginUserTest(httpServer, 'login2', 'password2');
        accessToken2 = result2.body.accessToken;

        user3 = await createUserTest(
          httpServer,
          'login3',
          'password3',
          'email3@mail.ru',
        );
        const result3 = await loginUserTest(httpServer, 'login3', 'password3');
        accessToken3 = result3.body.accessToken;

        user4 = await createUserTest(
          httpServer,
          'login4',
          'password4',
          'email4@mail.ru',
        );
        const result4 = await loginUserTest(httpServer, 'login4', 'password4');
        accessToken4 = result4.body.accessToken;
      }

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

      //create and login 4 users
      {
        user1 = await createUserTest(
          httpServer,
          'login1',
          'password1',
          'email1@mail.ru',
        );
        const result1 = await loginUserTest(httpServer, 'login1', 'password1');
        accessToken1 = result1.body.accessToken;

        user2 = await createUserTest(
          httpServer,
          'login2',
          'password2',
          'email2@mail.ru',
        );
        const result2 = await loginUserTest(httpServer, 'login2', 'password2');
        accessToken2 = result2.body.accessToken;

        user3 = await createUserTest(
          httpServer,
          'login3',
          'password3',
          'email3@mail.ru',
        );
        const result3 = await loginUserTest(httpServer, 'login3', 'password3');
        accessToken3 = result3.body.accessToken;

        user4 = await createUserTest(
          httpServer,
          'login4',
          'password4',
          'email4@mail.ru',
        );
        const result4 = await loginUserTest(httpServer, 'login4', 'password4');
        accessToken4 = result4.body.accessToken;
      }

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

      //3 correct and 2 incorrect answers by user1
      await addAnswersToQuizTest(httpServer, accessToken1, 3);
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

      //2 correct and 3 incorrect answers by user2
      await addAnswersToQuizTest(httpServer, accessToken2, 2);
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

    //checking auto-finishing the quiz
    it(`+ (200) user 1 and user 2 should start quiz №1;
              + (200) user 1 should send 3 correct answers;
              + (200) user 3 and user 4 should start quiz №2;`, async () => {
      //connect user1 and user2
      const result1 = await connectPlayerToQuizTest(httpServer, accessToken1);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      const result2 = await connectPlayerToQuizTest(httpServer, accessToken2);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

      //3 correct answers by user1
      await addAnswersToQuizTest(httpServer, accessToken1, 3, 3);

      //connect user3 and user4
      const result3 = await connectPlayerToQuizTest(httpServer, accessToken3);
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      const result4 = await connectPlayerToQuizTest(httpServer, accessToken4);
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.OK_200);

      //2 correct answers by user2
      await addAnswersToQuizTest(httpServer, accessToken2, 2, 2);
      //3 correct and 2 incorrect answers by user4
      await addAnswersToQuizTest(httpServer, accessToken4, 3);
      //2 correct answers by user1
      await addAnswersToQuizTest(httpServer, accessToken1, 2, 2);

      const quiz1Res1 = await getQuizByIdTest(
        httpServer,
        result1.body.id,
        accessToken1,
      );
      expect(quiz1Res1.body).toEqual(
        createResponseSingleQuizTest(
          'Active',
          '5questions',
          null,
          user1.body.id,
          5,
          user2.body.id,
          null,
          2,
          'string',
          'string',
          'string',
        ),
      );
      expect(quiz1Res1.body.firstPlayerProgress.answers.length).toBe(5);
      expect(quiz1Res1.body.secondPlayerProgress.answers.length).toBe(2);

      const quiz2Res1 = await getQuizByIdTest(
        httpServer,
        result3.body.id,
        accessToken3,
      );
      expect(quiz2Res1.body).toEqual(
        createResponseSingleQuizTest(
          'Active',
          '5questions',
          null,
          user3.body.id,
          0,
          user4.body.id,
          null,
          3,
          'string',
          null,
          'string',
        ),
      );
      expect(quiz2Res1.body.firstPlayerProgress.answers.length).toBe(0);
      expect(quiz2Res1.body.secondPlayerProgress.answers.length).toBe(5);

      //1 correct answer by user2
      await addAnswersToQuizTest(httpServer, accessToken2, 1, 1);

      //waiting 10 secs for auto finishing quiz
      await new Promise((resolve) => setTimeout(resolve, 10000));

      const quiz1Res2 = await getQuizByIdTest(
        httpServer,
        result1.body.id,
        accessToken1,
      );
      expect(quiz1Res2.body).toEqual(
        createResponseSingleQuizTest(
          'Finished',
          '5questions',
          null,
          user1.body.id,
          6,
          user2.body.id,
          null,
          3,
          'string',
          'string',
          'string',
          'string',
        ),
      );

      const quiz2Res2 = await getQuizByIdTest(
        httpServer,
        result3.body.id,
        accessToken3,
      );
      expect(quiz2Res2.body).toEqual(
        createResponseSingleQuizTest(
          'Finished',
          '5questions',
          null,
          user3.body.id,
          0,
          user4.body.id,
          null,
          4,
          'string',
          'string',
          'string',
          'string',
        ),
      );
    });
  });
});
