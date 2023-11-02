import { regexpISOSString } from '../../../infrastructure/utils/regexp/general-regexp';
import { QuestionPaginationType } from '../../../features/quiz/infrastructure/typeORM/query.repository/questions/questions.types.query.repository';
import { toBeOneOf } from 'jest-extended';
expect.extend({ toBeOneOf });

export const quizzesResponsesTestManager = {
  createResponseSaQuestion: function (
    updatedAt?: 'string' | null,
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
      updatedAt: updatedAt ? expect.stringMatching(regexpISOSString) : null,
    };
  },

  createResponseAllQuestionsSa: function (
    questionsIds: string[] | number,
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
        createdAt: expect.stringMatching(regexpISOSString),
        updatedAt: expect.toBeOneOf([expect.any(String), null]),
      });
    }
    return {
      pagesCount: pagesCount ?? 1,
      page: page ?? 1,
      pageSize: pageSize ?? 10,
      totalCount: totalCount ?? 0,
      items: allQuestions,
    };
  },

  createResponseSingleQuestionSa: function (
    questionsIds: string[] | number,
    body?: string | null,
    correctAnswers?: string[] | null,
    published?: boolean | null,
    updatedAt?: 'string' | null,
  ) {
    return {
      id: expect.any(String),
      body: body ?? expect.any(String),
      correctAnswers: correctAnswers ?? expect.any(Array),
      published: published ?? expect.any(Boolean),
      createdAt: expect.stringMatching(regexpISOSString),
      updatedAt: updatedAt === 'string' ? expect.any(String) : null,
    };
  },
};
