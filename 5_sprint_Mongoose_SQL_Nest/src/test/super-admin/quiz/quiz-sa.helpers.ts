import request from 'supertest';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { QuestionTestType } from './quiz-sa.types';
import { QuestionsQuiz } from '../../../features/quiz/domain/question-quiz.entity';
import { QuestionPaginationType } from '../../../features/quiz/infrastructure/typeORM/query.repository/quiz.types.query.repository';

export async function getAllQuestions(httpServer, query?, saLogin?, saPass?) {
  return request(httpServer)
    .get(`/hometask-nest/sa/quiz/questions`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
    .query(query ?? '');
}
export async function createQuestionSaTest(
  httpServer,
  body?,
  correctAnswers?,
  saLogin?,
  saPass?,
) {
  return request(httpServer)
    .post(`/hometask-nest/sa/quiz/questions`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
    .send({
      body: body ?? 'Solve: 2 + 2 = ?',
      correctAnswers: correctAnswers ?? ['4', 'four', 'четыре'],
    });
}

export async function updateQuestionSaTest(
  httpServer,
  id,
  body?,
  correctAnswers?,
  saLogin?,
  saPass?,
) {
  return request(httpServer)
    .put(`/hometask-nest/sa/quiz/questions/${id}`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
    .send({
      body: body ?? 'Solve: 3 + 3 = ?',
      correctAnswers: correctAnswers ?? ['6', 'six', 'шесть'],
    });
}

export async function publishQuestionSaTest(
  httpServer,
  id,
  published,
  saLogin?,
  saPass?,
) {
  return request(httpServer)
    .put(`/hometask-nest/sa/quiz/questions/${id}/publish`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
    .send({
      published,
    });
}

export async function deleteQuestionSaTest(httpServer, id, saLogin?, saPass?) {
  return request(httpServer)
    .delete(`/hometask-nest/sa/quiz/questions/${id}`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty');
}

export async function getQuestionAllInfoTest(dataSource, questionId) {
  const result = await dataSource
    .createQueryBuilder(QuestionsQuiz, 'q')
    .select([
      'q."id"',
      'q."body"',
      'q."correctAnswers"',
      'q."published"',
      'q."createdAt"',
      'q."updatedAt"',
    ])
    .where('q."id" = :id', { id: questionId })
    .getRawOne();

  return result ?? null;
}

export async function createCorrectQuestionSaTest(
  httpServer,
  body?,
  correctAnswers?,
): Promise<QuestionTestType> {
  const result = await request(httpServer)
    .post(`/hometask-nest/sa/quiz/questions`)
    .auth('admin', 'qwerty')
    .send({
      body: body === undefined ? 'Solve: 2 + 2 = ?' : null,
      correctAnswers:
        correctAnswers === undefined ? ['4', 'four', 'четыре'] : null,
    });
  expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
  expect(result.body.updatedAt).toBeNull();
  expect(result.body.published).toBeFalsy();
  return result.body;
}

export async function create9Questions(httpServer): Promise<string[]> {
  const questionNumber = [
    'Fourth',
    'first',
    'second',
    'third',
    'fifth',
    'sixth',
    'seventh',
    'eighth',
    'ninth',
  ];
  const questionsIds: any = [];
  let count = 1;
  for (const i of questionNumber) {
    const result = await createQuestionSaTest(
      httpServer,
      `Question body ${count} ${i}`,
      [`${i}`, `${count}`],
    );
    expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
    questionsIds.push(result.body.id);
    count++;
  }
  return questionsIds.reverse();
}

export function createResponseQuestion(
  updatedAt?: null,
  published?,
  body?,
  correctAnswers?,
) {
  return {
    id: expect.any(String),
    body: body ?? expect.any(String),
    correctAnswers: correctAnswers ?? expect.any(Array),
    published: published ?? expect.any(Boolean),
    createdAt: expect.any(String),
    updatedAt: updatedAt === undefined ? expect.any(String) : null,
  };
}

export function createResponseAllQuestionsTest(
  questionsIds: Array<string> | number,
  totalCount?: number | null,
  pagesCount?: number | null,
  page?: number | null,
  pageSize?: number,
): QuestionPaginationType {
  const allQuestions: any = [];
  const limit =
    typeof questionsIds === 'number' ? questionsIds : questionsIds.length;
  for (let i = 0; i < limit; i++) {
    allQuestions.push({
      id: questionsIds[i] ?? expect.any(String),
      body: expect.any(String),
      correctAnswers: expect.any(Array),
      published: expect.any(Boolean),
      createdAt: expect.any(String),
      updatedAt: null,
    });
  }
  return {
    pagesCount: pagesCount ?? 1,
    page: page ?? 1,
    pageSize: pageSize ?? 10,
    totalCount: totalCount ?? 0,
    items: allQuestions,
  };
}
