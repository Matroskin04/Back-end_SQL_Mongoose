import { regexpISOSString } from '../../../infrastructure/utils/regexp/general-regexp';
import { toBeOneOf } from 'jest-extended';
expect.extend({ toBeOneOf });

export const usersResponsesTestManager = {
  createResponseSingleUserSa: function (
    login?,
    email?,
    banDate?: 'string' | null,
    banReason?: 'string' | null,
    isBanned?: boolean,
  ) {
    return {
      id: expect.any(String),
      login: login ?? expect.any(String),
      email: email ?? expect.any(String),
      createdAt: expect.any(String),
      banInfo: {
        banDate:
          banDate === 'string' ? expect.stringMatching(regexpISOSString) : null,
        banReason: banReason === 'string' ? expect.any(String) : null,
        isBanned: isBanned ?? expect.any(Boolean),
      },
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
        banInfo: {
          banDate: expect.toBeOneOf([
            expect.stringMatching(regexpISOSString),
            null,
          ]),
          banReason: expect.toBeOneOf([expect.any(String), null]),
          isBanned: expect.any(Boolean),
        },
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
