import { INestApplication } from '@nestjs/common';
import { startApp } from '../../test.utils';
import { deleteAllDataTest } from '../../utils/general/delete-all-data.helper';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { createErrorsMessageTest } from '../../utils/general/errors-message.helper';
import { v4 as uuidv4 } from 'uuid';
import { usersRequestsTestManager } from '../../utils/users/users-requests-test.manager';
import { usersResponsesTestManager } from '../../utils/users/users-responses-test.manager';

describe('Users (SA); /sa', () => {
  jest.setTimeout(5 * 60 * 1000);

  //vars for starting app and testing
  let app: INestApplication;
  let httpServer;

  beforeAll(async () => {
    const info = await startApp();
    app = info.app;
    httpServer = info.httpServer;
  });

  afterAll(async () => {
    await httpServer.close();
    await app.close();
  });

  let busyEmail;
  let busyLogin;
  const freeCorrectEmail = 'freeEmail@gmail.com';
  const freeCorrectLogin = 'freeLogin';
  const correctPass = 'correctPass1';

  const loginLength2 = '12';
  const loginLength11 = '1'.repeat(11);
  const passwordLength5 = '1'.repeat(5);
  const passwordLength21 = '1'.repeat(21);
  const incorrectEmail = 'incorrectEmail';

  describe(`/users (GET) - get all users`, () => {
    let usersIds;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      usersIds = await usersRequestsTestManager.create9UsersSa(httpServer);
    });

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        null,
        'IncorrectSaLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        null,
        null,
        'IncorrectSaPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) should return 9 users`, async () => {
      const result = await usersRequestsTestManager.getUsersSa(httpServer);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        usersResponsesTestManager.createResponseUsersSa(usersIds, 9),
      );
    });

    it(`+ (200) should return 3 users (query: pageSize=3, pageNumber=2)
              + (200) should return 4 users (query: pageSize=5, pageNumber=2)`, async () => {
      //3 users
      const result1 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'pageSize=3&&pageNumber=2',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        usersResponsesTestManager.createResponseUsersSa(
          usersIds.slice(3, 6),
          9,
          3,
          2,
          3,
        ),
      );

      //4 users
      const result2 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'pageSize=5&&pageNumber=2',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        usersResponsesTestManager.createResponseUsersSa(
          usersIds.slice(5),
          9,
          2,
          2,
          5,
        ),
      );
    });

    it(`+ (200) should return 5 users (query: sortBy=login&&pageSize=5)
              + (200) should return 5 users (query: sortBy=email&&pageSize=5)
              + (200) should return 9 users (query: sortDirection=asc)
              + (200) should return 9 users (query: sortBy=id&&sortDirection=desc)`, async () => {
      const usersIdsCopy = [...usersIds];
      //sortBy=login, total 9 users
      const result1 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'sortBy=login&&pageSize=5',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        usersResponsesTestManager.createResponseUsersSa(
          usersIdsCopy.slice(0, 5),
          9,
          2,
          1,
          5,
        ),
      );

      //sortBy=email, total 9 users
      const result2 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'sortBy=email&&pageSize=5',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        usersResponsesTestManager.createResponseUsersSa(
          usersIdsCopy.slice(0, 5),
          9,
          2,
          1,
          5,
        ),
      );

      //sortDirection=asc, total 9 users
      const result4 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'sortDirection=asc',
      );
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result4.body).toEqual(
        usersResponsesTestManager.createResponseUsersSa(
          usersIdsCopy.reverse(),
          9,
          1,
          1,
          10,
        ),
      );

      //sortBy=id&&sortDirection=desc, total 9 users
      const result5 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'sortBy=id&&sortDirection=desc',
      );
      expect(result5.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result5.body).toEqual(
        usersResponsesTestManager.createResponseUsersSa(
          usersIdsCopy.sort().reverse(),
          9,
          1,
          1,
          10,
        ),
      );
    });

    it(`+ (200) should return 1 user (query: searchLoginTerm=irs)
              + (200) should return 7 users (query: searchLoginTerm=TH)
              + (200) should return 4 users (query: searchLoginTerm=S)
              + (200) should return 1 user (query: searchEmailTerm=irs)
              + (200) should return 7 users (query: searchEmailTerm=TH)
              + (200) should return 4 users (query: searchEmailTerm=S)`, async () => {
      //searchLoginTerm=irs, 1 user
      const result1 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'searchLoginTerm=irs',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(
        usersResponsesTestManager.createResponseUsersSa(
          [usersIds[8]],
          1,
          1,
          1,
          10,
        ),
      );

      //searchLoginTerm=TH, 7 users
      const result2 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'searchLoginTerm=TH',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(
        usersResponsesTestManager.createResponseUsersSa(
          usersIds.slice(0, 7),
          7,
          1,
          1,
          10,
        ),
      );

      //searchLoginTerm=S, 4 users
      const result3 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'searchLoginTerm=S',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result3.body).toEqual(
        usersResponsesTestManager.createResponseUsersSa(
          usersIds.filter((e, i) => i === 2 || i === 3 || i === 7 || i === 8),
          4,
          1,
          1,
          10,
        ),
      );

      //searchEmailTerm=irs, 1 user
      const result4 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'searchEmailTerm=irs',
      );
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result4.body).toEqual(
        usersResponsesTestManager.createResponseUsersSa(
          [usersIds[8]],
          1,
          1,
          1,
          10,
        ),
      );

      //searchEmailTerm=TH, 7 users
      const result5 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'searchEmailTerm=TH',
      );
      expect(result5.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result5.body).toEqual(
        usersResponsesTestManager.createResponseUsersSa(
          usersIds.slice(0, 7),
          7,
          1,
          1,
          10,
        ),
      );

      //searchEmailTerm=S, 4 users
      const result6 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'searchEmailTerm=S',
      );
      expect(result6.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result6.body).toEqual(
        usersResponsesTestManager.createResponseUsersSa(
          usersIds.filter((e, i) => i === 2 || i === 3 || i === 7 || i === 8),
          4,
          1,
          1,
          10,
        ),
      );
    });

    it(`- (400) sortBy has incorrect value (query: sortBy=Truncate;)
              - (400) sortDirection has incorrect value (query: sortDirection=Truncate;)`, async () => {
      //status 400
      const result1 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'sortBy=Truncate;',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['sortBy']));

      //status 400
      const result2 = await usersRequestsTestManager.getUsersSa(
        httpServer,
        'sortDirection=Truncate;',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['sortDirection']));
    });
  });

  describe(`/users (POST) - create user by sa`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);
    });

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await usersRequestsTestManager.createUserSa(
        httpServer,
        freeCorrectLogin,
        correctPass,
        freeCorrectEmail,
        'IncorrectSaLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await usersRequestsTestManager.createUserSa(
        httpServer,
        freeCorrectLogin,
        correctPass,
        freeCorrectEmail,
        null,
        'IncorrectSaPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (400) values of 'login', 'password' are incorrect (small length)
              - (400) values of 'login', 'password' are incorrect (large length)
              - (400) values of 'login', 'email' are incorrect (incorrect regexp)`, async () => {
      const result1 = await usersRequestsTestManager.createUserSa(
        httpServer,
        loginLength2,
        passwordLength5,
        freeCorrectEmail,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(
        createErrorsMessageTest(['login', 'password']),
      );

      const result2 = await usersRequestsTestManager.createUserSa(
        httpServer,
        loginLength11,
        passwordLength21,
        freeCorrectEmail,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(
        createErrorsMessageTest(['login', 'password']),
      );

      const result3 = await usersRequestsTestManager.createUserSa(
        httpServer,
        '~&^%$#@',
        correctPass,
        incorrectEmail,
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result3.body).toEqual(createErrorsMessageTest(['login', 'email']));
    });

    it(`+ (201) should create user`, async () => {
      const result = await usersRequestsTestManager.createUserSa(
        httpServer,
        freeCorrectLogin,
        correctPass,
        freeCorrectEmail,
      );

      expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      expect(result.body).toEqual(
        usersResponsesTestManager.createResponseSingleUserSa(
          freeCorrectLogin,
          freeCorrectEmail,
        ),
      );
      busyEmail = freeCorrectEmail;
      busyLogin = freeCorrectLogin;
    });

    //dependent
    it(`- (400) user with such 'email' already exists
              - (400) user with such 'login' already exists`, async () => {
      //busy email
      const result1 = await usersRequestsTestManager.createUserSa(
        httpServer,
        'FreeLogin',
        correctPass,
        busyEmail,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['email']));

      //busy login
      const result2 = await usersRequestsTestManager.createUserSa(
        httpServer,
        busyLogin,
        correctPass,
        'correctEmail@mail.ru',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['login']));
    });
  });

  describe(`/users/:id (DELETE) - delete user by id`, () => {
    let correctUserId;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      const user = await usersRequestsTestManager.createUserSa(
        httpServer,
        freeCorrectLogin,
        correctPass,
        freeCorrectEmail,
      );
      correctUserId = user.body.id;
    });

    it(`- (401) sa login is incorrect
              - (401) sa password is incorrect`, async () => {
      //sa login is incorrect
      const result1 = await usersRequestsTestManager.deleteUserSa(
        httpServer,
        correctUserId,
        freeCorrectEmail,
        'IncorrectSaLogin',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //sa password is incorrect
      const result2 = await usersRequestsTestManager.deleteUserSa(
        httpServer,
        correctUserId,
        null,
        'IncorrectSaPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) user doesn't exist with such id`, async () => {
      const result = await usersRequestsTestManager.deleteUserSa(
        httpServer,
        uuidv4(),
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (204) should delete user`, async () => {
      const result = await usersRequestsTestManager.deleteUserSa(
        httpServer,
        correctUserId,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check that user is deleted
      const users = await usersRequestsTestManager.getUsersSa(httpServer);
      expect(users.body.items.find((u) => u.id === correctUserId)).toBeFalsy();
    });
  });
});
