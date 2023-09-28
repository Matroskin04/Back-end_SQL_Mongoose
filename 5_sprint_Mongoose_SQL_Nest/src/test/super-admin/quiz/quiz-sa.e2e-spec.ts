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
import { createAndLogin3UsersTest } from '../../public/blogs/blogs-public.helpers';
import { createBlogTest } from '../../blogger/blogs/blogs-blogger.helpers';
import {
  create9PostsOf3BlogsBy3Users,
  getPostsPublicTest,
} from '../../public/posts/posts-public.helpers';
import { createResponseAllPostsTest } from '../../public/blogs/posts-blogs-puclic.helpers';

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

    /*    it(`+ (200) should return 3 posts (query: pageSize=3, pageNumber=2)
              + (200) should return 4 posts (query: pageSize=5, pageNumber=2)`, async () => {
      //3 posts
      const result1 = await getPostsPublicTest(
        httpServer,
        'pageSize=3&&pageNumber=2',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllPostsTest(
          postsIds.slice(3, 6),
          null,
          null,
          null,
          9,
          3,
          2,
          3,
        ),
      );

      //4 posts
      const result2 = await getPostsPublicTest(
        httpServer,
        'pageSize=5&&pageNumber=2',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllPostsTest(
          postsIds.slice(5),
          null,
          null,
          null,
          9,
          2,
          2,
          5,
        ),
      );
    });

    it(`+ (200) should return 5 posts (query: sortBy=title&&pageSize=5)
              + (200) should return 5 posts (query: sortBy=content&&pageSize=5)
              + (200) should return 5 posts (query: sortBy=shortDescription&&pageSize=5)`, async () => {
      const postsIdsCopy = [...postsIds];
      //sortBy=name, total 9 posts
      const result1 = await getPostsPublicTest(
        httpServer,
        'sortBy=title&&pageSize=5',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllPostsTest(
          postsIdsCopy.slice(0, 5),
          null,
          null,
          null,
          9,
          2,
          1,
          5,
        ),
      );

      //sortBy=content, total 9 posts
      const result2 = await getPostsPublicTest(
        httpServer,
        'sortBy=title&&pageSize=5',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllPostsTest(
          postsIdsCopy.slice(0, 5),
          null,
          null,
          null,
          9,
          2,
          1,
          5,
        ),
      );

      //sortBy=shortDescription, total 9 posts
      const result3 = await getPostsPublicTest(
        httpServer,
        'sortBy=title&pageSize=5',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        createResponseAllPostsTest(
          postsIdsCopy.slice(0, 5),
          null,
          null,
          null,
          9,
          2,
          1,
          5,
        ),
      );
    });

    it(`+ (200) should return 9 posts (query: sortDirection=asc)
              + (200) should return 9 posts (query: sortBy=id&&sortDirection=desc)
              + (200) should return 9 posts (query: sortBy=blogName&&sortDirection=desc)`, async () => {
      const postsIdsCopy = [...postsIds];
      //sortDirection=asc, total 9 posts
      const result1 = await getPostsPublicTest(httpServer, 'sortDirection=asc');
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        createResponseAllPostsTest(
          postsIdsCopy.reverse(),
          null,
          null,
          null,
          9,
          1,
          1,
          10,
        ),
      );

      //sortBy=id&&sortDirection=desc, total 9 posts
      const result2 = await getPostsPublicTest(
        httpServer,
        'sortBy=id&sortDirection=desc',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        createResponseAllPostsTest(
          postsIdsCopy.sort().reverse(),
          null,
          null,
          null,
          9,
          1,
          1,
          10,
        ),
      );

      //sortBy=blogName&sortDirection=desc, total 9 posts
      const result3 = await getPostsPublicTest(
        httpServer,
        'sortBy=blogName&sortDirection=desc',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        createResponseAllPostsTest(9, null, null, null, 9, 1, 1, 10, [
          'c blog 3',
          'c blog 3',
          'c blog 3',
          'blog 2',
          'blog 2',
          'blog 2',
          'Blog 1',
          'Blog 1',
          'Blog 1',
        ]),
      );
    });

    it(`- (400) sortBy has incorrect value (query: sortBy=Truncate;)
              - (400) sortDirection has incorrect value (query: sortDirection=Truncate;)`, async () => {
      //status 400
      const result1 = await getPostsPublicTest(httpServer, 'sortBy=Truncate;');
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['sortBy']));

      //status 400
      const result2 = await getPostsPublicTest(
        httpServer,
        'sortDirection=Truncate;',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['sortDirection']));
    });*/
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
