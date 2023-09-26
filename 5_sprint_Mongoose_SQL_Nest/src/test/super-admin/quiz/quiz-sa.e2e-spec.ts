import { INestApplication } from '@nestjs/common';
import { startApp } from '../../test.utils';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { v4 as uuidv4 } from 'uuid';
import {
  createCorrectQuestionSaTest,
  createQuestionSaTest,
  createResponseQuestion,
  deleteQuestionSaTest,
  getQuestionAllInfoTest,
  publishQuestionSaTest,
  updateQuestionSaTest,
} from './quiz-sa.helpers';
import { createErrorsMessageTest } from '../../helpers/errors-message.helper';
import { DataSource } from 'typeorm';
import { QuestionQuiz } from '../../../features/quiz/domain/question-quiz.entity';

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

  //correct data question
  let correctQuestionId;
  let questionData;
  const correctBody = 'Solve: 3 + 3 = ?';
  const correctAnswers = ['6', 'шесть', 'six'];
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
      const result1 = await createQuestionSaTest(
        httpServer,
        null,
        null,
        'incorrectLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await createQuestionSaTest(
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
      const result1 = await createQuestionSaTest(
        httpServer,
        bodyLength501,
        'not an array',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(
        createErrorsMessageTest(['body', 'correctAnswers']),
      );
      //body length, answers array contains not a string
      const result2 = await createQuestionSaTest(httpServer, bodyLength9, [
        '123',
        123,
      ]);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(
        createErrorsMessageTest(['body', 'correctAnswers']),
      );
      //body is not a string, length of array < 1
      const result3 = await createQuestionSaTest(httpServer, 123, []);
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result3.body).toEqual(
        createErrorsMessageTest(['body', 'correctAnswers']),
      );
      //body length is less than 10 after trim
      const result4 = await createQuestionSaTest(httpServer, '              ', [
        'correct',
      ]);
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result4.body).toEqual(createErrorsMessageTest(['body']));
    });

    it(`+ (201) should create question for quiz`, async () => {
      const result = await createQuestionSaTest(
        httpServer,
        correctBody,
        correctAnswers,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      expect(result.body).toEqual(
        createResponseQuestion(null, false, correctBody, correctAnswers),
      );
    });
  });

  describe(`/questions/:id (PUT) - update question`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      questionData = await createCorrectQuestionSaTest(httpServer);
      correctQuestionId = questionData.id;
    });

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await updateQuestionSaTest(
        httpServer,
        correctQuestionId,
        null,
        null,
        'incorrectLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await updateQuestionSaTest(
        httpServer,
        correctQuestionId,
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
      const result1 = await updateQuestionSaTest(
        httpServer,
        correctQuestionId,
        bodyLength501,
        'not an array',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(
        createErrorsMessageTest(['body', 'correctAnswers']),
      );
      //body length, answers array contains not a string
      const result2 = await updateQuestionSaTest(
        httpServer,
        correctQuestionId,
        bodyLength9,
        ['123', 123],
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(
        createErrorsMessageTest(['body', 'correctAnswers']),
      );
      //body is not a string, length of array < 1
      const result3 = await updateQuestionSaTest(
        httpServer,
        correctQuestionId,
        123,
        [],
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result3.body).toEqual(
        createErrorsMessageTest(['body', 'correctAnswers']),
      );
      //body length is less than 10 after trim
      const result4 = await updateQuestionSaTest(
        httpServer,
        correctQuestionId,
        '              ',
        ['correct'],
      );
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result4.body).toEqual(createErrorsMessageTest(['body']));
    });

    it(`- (404) question with such id doesn't exist`, async () => {
      const result = await updateQuestionSaTest(
        httpServer,
        uuidv4(),
        null,
        null,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (204) should update question`, async () => {
      const result = await updateQuestionSaTest(
        httpServer,
        correctQuestionId,
        'new question body',
        ['new 1', 'new 2'],
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check that fields were changed, and updated date was set
      const updatedQuestion = await getQuestionAllInfoTest(
        dataSource,
        correctQuestionId,
      );
      expect(updatedQuestion.body).toBe('new question body');
      expect(updatedQuestion.correctAnswers).toBe('new 1,new 2');
      expect(updatedQuestion.updatedAt).not.toBeNull();
    });
  });

  describe(`/questions/:id (DELETE) - delete question`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      questionData = await createCorrectQuestionSaTest(httpServer);
      correctQuestionId = questionData.id;
    });

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await deleteQuestionSaTest(
        httpServer,
        correctQuestionId,
        'incorrectLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await deleteQuestionSaTest(
        httpServer,
        correctQuestionId,
        null,
        'IncorrectPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) question with such id doesn't exist`, async () => {
      const result = await deleteQuestionSaTest(httpServer, uuidv4());
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (204) should delete question`, async () => {
      const result = await deleteQuestionSaTest(httpServer, correctQuestionId);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check that deletion is successful
      const updatedQuestion = await getQuestionAllInfoTest(
        dataSource,
        correctQuestionId,
      );
      expect(updatedQuestion).toBeNull();
    });
  });
});
