import { INestApplication } from '@nestjs/common';
import { startApp } from '../../test.utils';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { v4 as uuidv4 } from 'uuid';
import {
  create9Questions,
  createCorrectQuestionSaTest,
  createQuestionSaTest,
  createResponseAllQuestionsTest,
  createResponseQuestion,
  deleteQuestionSaTest,
  getAllQuestions,
  getQuestionAllInfoTest,
  publishQuestionSaTest,
  updateQuestionSaTest,
} from './quiz-sa.helpers';
import { createErrorsMessageTest } from '../../helpers/errors-message.helper';
import { DataSource } from 'typeorm';

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

  describe(`/questions (GET) - get all questions`, () => {
    let questionsIds;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create 9 questions
      questionsIds = await create9Questions(httpServer);
    });

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await getAllQuestions(httpServer, null, 'incorrectLogin');
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await getAllQuestions(
        httpServer,
        null,
        null,
        'IncorrectPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) should return 9 questions`, async () => {
      const result = await getAllQuestions(httpServer);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseAllQuestionsTest(questionsIds, 9),
      );
    });

    it(`+ (200) should return 3 questions (query: pageSize=3, pageNumber=2)
              + (200) should return 4 questions (query: pageSize=5, pageNumber=2)`, async () => {
      //3 questions
      const result1 = await getAllQuestions(
        httpServer,
        'pageSize=3&&pageNumber=2',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllQuestionsTest(questionsIds.slice(3, 6), 9, 3, 2, 3),
      );

      //4 questions
      const result2 = await getAllQuestions(
        httpServer,
        'pageSize=5&&pageNumber=2',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllQuestionsTest(questionsIds.slice(5), 9, 2, 2, 5),
      );
    });

    it(`+ (200) should return 5 questions (query: sortBy=body&&pageSize=5)
              + (200) should return 5 questions (query: sortBy=createdAt&&pageSize=5)`, async () => {
      //sortBy=body, total 9 questions
      const result1 = await getAllQuestions(
        httpServer,
        'sortBy=body&&pageSize=5',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllQuestionsTest(questionsIds.slice(0, 5), 9, 2, 1, 5),
      );

      //sortBy=createdAt, total 9 questions
      const result2 = await getAllQuestions(
        httpServer,
        'sortBy=createdAt&&pageSize=5',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllQuestionsTest(questionsIds.slice(0, 5), 9, 2, 1, 5),
      );
    });

    it(`+ (200) should return 9 questions (query: sortDirection=asc)
              + (200) should return 9 questions (query: sortBy=id&&sortDirection=desc)
              + (200) should return 9 questions (query: sortBy=body&&sortDirection=asc)`, async () => {
      //sortDirection=asc, total 9 questions
      const result1 = await getAllQuestions(httpServer, 'sortDirection=asc');
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllQuestionsTest(
          [...questionsIds].reverse(),
          9,
          1,
          1,
          10,
        ),
      );

      //sortBy=id&&sortDirection=desc, total 9 questions
      const result2 = await getAllQuestions(
        httpServer,
        'sortBy=id&sortDirection=desc',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllQuestionsTest(
          [...questionsIds].sort().reverse(),
          9,
          1,
          1,
          10,
        ),
      );

      //sortBy=body&&sortDirection=asc, total 9 questions
      const result3 = await getAllQuestions(
        httpServer,
        'sortBy=body&sortDirection=asc',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        createResponseAllQuestionsTest(
          [...questionsIds].reverse(),
          9,
          1,
          1,
          10,
        ),
      );
    });

    it(`+ (200) should return 1 question (query: bodySearchTerm=irs)
              + (200) should return 7 questions (query: bodySearchTerm=TH)
              + (200) should return 4 questions (query: bodySearchTerm=S)`, async () => {
      //bodySearchTerm=irs, 1 question
      const result1 = await getAllQuestions(httpServer, 'bodySearchTerm=irs');

      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllQuestionsTest([questionsIds[7]], 1, 1, 1, 10),
      );

      //bodySearchTerm=TH, 7 questions
      const result2 = await getAllQuestions(httpServer, 'bodySearchTerm=TH');
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllQuestionsTest(
          [...questionsIds.slice(0, 6), questionsIds[8]],
          7,
          1,
          1,
          10,
        ),
      );

      //bodySearchTerm=S, 4 questions
      const result3 = await getAllQuestions(httpServer, 'bodySearchTerm=V');
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        createResponseAllQuestionsTest(
          questionsIds.filter((e, i) => i === 2),
          1,
          1,
          1,
          10,
        ),
      );
    });

    it(`(Addition) + (204) should publish 3 questions
              + (200) should return 9 questions (query: publishedStatus=all)
              + (200) should return 3 questions (query: publishedStatus=published)
              + (200) should return 6 questions (query: publishedStatus=notPublished)`, async () => {
      //publish 3 questions
      for (const i of questionsIds.slice(0, 3)) {
        const result = await publishQuestionSaTest(httpServer, i, true);
        expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      }

      //publishedStatus=all, 9 questions
      const result1 = await getAllQuestions(httpServer, 'publishedStatus=all');
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllQuestionsTest(questionsIds, 9, 1, 1, 10),
      );

      //publishedStatus=published, 3 questions
      const result2 = await getAllQuestions(
        httpServer,
        'publishedStatus=published',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllQuestionsTest(questionsIds.slice(0, 3), 3, 1, 1, 10),
      );

      //publishedStatus=notPublished, 6 questions
      const result3 = await getAllQuestions(
        httpServer,
        'publishedStatus=notPublished',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        createResponseAllQuestionsTest(questionsIds.slice(3), 6, 1, 1, 10),
      );
    });

    it(`- (400) sortBy has incorrect value (query: sortBy=Truncate;)
              - (400) sortDirection has incorrect value (query: sortDirection=Truncate;)
              - (400) publishedStatus has incorrect value (query: publishedStatus=Truncate;)`, async () => {
      //status 400
      const result1 = await getAllQuestions(httpServer, 'sortBy=Truncate;');
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['sortBy']));

      //status 400
      const result2 = await getAllQuestions(
        httpServer,
        'sortDirection=Truncate;',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['sortDirection']));

      //status 400
      const result3 = await getAllQuestions(
        httpServer,
        'publishedStatus=Truncate;',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result3.body).toEqual(
        createErrorsMessageTest(['publishedStatus']),
      );
    });
  });

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

  describe(`/questions/:id/publish (PUT) - update publish status of a question`, () => {
    let questionWithoutAnswersId;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      questionData = await createCorrectQuestionSaTest(httpServer);
      correctQuestionId = questionData.id;

      const question2 = await createCorrectQuestionSaTest(
        httpServer,
        'some interesting question',
        null,
      );
      questionWithoutAnswersId = question2.id;
    });

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await publishQuestionSaTest(
        httpServer,
        correctQuestionId,
        true,
        'incorrectLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await publishQuestionSaTest(
        httpServer,
        correctQuestionId,
        true,
        null,
        'IncorrectPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (400) input value of the field 'published' is not boolean,
              - (400) specified question doesn't have correct answers`, async () => {
      //value is not boolean
      const result1 = await publishQuestionSaTest(
        httpServer,
        correctQuestionId,
        'string',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['published']));

      //question doesn't have correct answers
      const result2 = await publishQuestionSaTest(
        httpServer,
        questionWithoutAnswersId,
        true,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['correctAnswers']));
    });

    it(`- (404) question with such id doesn't exist`, async () => {
      const result = await publishQuestionSaTest(httpServer, uuidv4(), true);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (204) should set true for field 'published' of the question
              + (204) should set false for field 'published' of the question`, async () => {
      //published true
      const result1 = await publishQuestionSaTest(
        httpServer,
        correctQuestionId,
        true,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check that field was changed
      const updatedQuestion1 = await getQuestionAllInfoTest(
        dataSource,
        correctQuestionId,
      );
      expect(updatedQuestion1.published).toBeTruthy();

      //published false
      const result2 = await publishQuestionSaTest(
        httpServer,
        correctQuestionId,
        false,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check that field was changed
      const updatedQuestion2 = await getQuestionAllInfoTest(
        dataSource,
        correctQuestionId,
      );
      expect(updatedQuestion2.published).toBeFalsy();
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
