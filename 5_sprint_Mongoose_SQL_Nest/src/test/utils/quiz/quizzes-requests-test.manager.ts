import request from 'supertest';
import { RouterPaths } from '../router-paths';
import { QuestionQuiz } from '../../../features/quiz/domain/question-quiz.entity';
import { QuestionTestType } from '../../super-admin/quiz/quiz-sa.types';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';

export const quizzesRequestsTestManager = {
  getAllQuestionsSa: async function (httpServer, query?, saLogin?, saPass?) {
    return request(httpServer)
      .get(RouterPaths.questionsSa)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
      .query(query ?? '');
  },

  getQuestionAllInfo: async function (dataSource, questionId) {
    const result = await dataSource
      .createQueryBuilder(QuestionQuiz, 'q')
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
  },

  createQuestionSa: async function (
    httpServer,
    body?,
    correctAnswers?,
    saLogin?,
    saPass?,
  ) {
    return request(httpServer)
      .post(RouterPaths.questionsSa)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
      .send({
        body: body ?? 'Solve: 2 + 2 = ?',
        correctAnswers: correctAnswers ?? ['4', 'four', 'четыре'],
      });
  },

  createCorrectQuestionSa: async function (
    httpServer,
    body?,
    correctAnswers?,
  ): Promise<QuestionTestType> {
    const result = await request(httpServer)
      .post(RouterPaths.questionsSa)
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
  },

  create9Questions: async function (httpServer): Promise<string[]> {
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
      const result = await this.createQuestionSa(
        httpServer,
        `Question body ${count} ${i}`,
        [`${i}`, `${count}`, 'correctAnswer'],
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      questionsIds.push(result.body.id);
      count++;
    }
    return questionsIds.reverse();
  },

  updateQuestionSa: async function (
    httpServer,
    id,
    body?,
    correctAnswers?,
    saLogin?,
    saPass?,
  ) {
    return request(httpServer)
      .put(RouterPaths.questionsSa + `/${id}`)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
      .send({
        body: body ?? 'Solve: 3 + 3 = ?',
        correctAnswers: correctAnswers ?? ['6', 'six', 'шесть'],
      });
  },

  publishQuestionSa: async function (
    httpServer,
    id,
    published,
    saLogin?,
    saPass?,
  ) {
    return request(httpServer)
      .put(RouterPaths.questionsSa + `/${id}/publish`)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
      .send({
        published,
      });
  },

  deleteQuestionSa: async function (httpServer, id, saLogin?, saPass?) {
    return request(httpServer)
      .delete(RouterPaths.questionsSa + `/${id}`)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty');
  },
};
