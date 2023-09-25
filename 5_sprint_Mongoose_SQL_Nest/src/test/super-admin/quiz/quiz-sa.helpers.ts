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
      body: body ?? '2+2=?',
      correctAnswers: correctAnswers ?? ['4', 'four', 'четыре'],
    });
}
