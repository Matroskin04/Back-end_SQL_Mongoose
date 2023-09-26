import request from 'supertest';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { QuestionTestType } from './quiz-sa.types';

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
  body?,
  correctAnswers?,
  saLogin?,
  saPass?,
) {
  return request(httpServer)
    .post(`/hometask-nest/sa/quiz/questions`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
    .send({
      body: body ?? 'Solve: 3 + 3 = ?',
      correctAnswers: correctAnswers ?? ['6', 'six', 'шесть'],
    });
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

export async function createCorrectQuestionSaTest(
  httpServer,
  body?,
  correctAnswers?,
): Promise<QuestionTestType> {
  const result = await request(httpServer)
    .post(`/hometask-nest/sa/quiz/questions`)
    .auth('admin', 'qwerty')
    .send({
      body: body ?? 'Solve: 2 + 2 = ?',
      correctAnswers: correctAnswers ?? ['4', 'four', 'четыре'],
    });
  expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
  expect(result.body).toEqual(createResponseQuestion(null, false));
  return result.body;
}
