import { regexpISOSString } from '../../../infrastructure/utils/regexp/general-regexp';
import { QuestionPaginationType } from '../../../features/quiz/infrastructure/typeORM/query.repository/questions/questions.types.query.repository';
import { toBeOneOf } from 'jest-extended';
expect.extend({ toBeOneOf });

export const usersResponsesTestManager = {
  createResponseSingleUserSa: function (login?, email?) {
    return {
      id: expect.any(String),
      login: login ?? expect.any(String),
      email: email ?? expect.any(String),
      createdAt: expect.any(String),
    };
  },

  createResponseUsersSa: function (
    idsOfUsers: Array<string> | number,
    totalCount?: number,
    pagesCount?: number,
    page?: number,
    pageSize?: number,
  ) {
    const allUsers: any = [];
    const limit =
      typeof idsOfUsers === 'number' ? idsOfUsers : idsOfUsers.length;

    for (let i = 0; i < limit; i++) {
      allUsers.push({
        id: idsOfUsers[i] ?? expect.any(String),
        login: expect.any(String),
        email: expect.any(String),
        createdAt: expect.any(String),
      });
    }
    return {
      pagesCount: pagesCount ?? 1,
      page: page ?? 1,
      pageSize: pageSize ?? 10,
      totalCount: totalCount ?? 0,
      items: allUsers,
    };
  },
};
