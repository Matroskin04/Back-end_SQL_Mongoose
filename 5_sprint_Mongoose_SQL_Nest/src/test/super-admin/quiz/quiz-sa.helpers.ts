import request from 'supertest';

export async function createQuestionQuizSaTest(
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

export function createResponseQuestion(
  updatedAt?: null,
  body?,
  correctAnswers?,
  published?,
) {
  return {
    id: expect.any(String),
    body: body ?? expect.any(String),
    correctAnswers: correctAnswers ?? expect.any(Array),
    published: published ?? expect.any(Boolean),
    createdAt: expect.any(String),
    updatedAt: updatedAt ?? expect.any(String),
  };
}
