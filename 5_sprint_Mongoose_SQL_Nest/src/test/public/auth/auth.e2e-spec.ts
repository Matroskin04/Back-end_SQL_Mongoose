import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { emailAdapterMock } from '../mock.providers/auth.mock.providers';
import { v4 as uuidv4 } from 'uuid';
import {
  confirmEmailTest,
  createNewRefreshAccessTokensTest,
  getCurrentUserInfoTest,
  loginUserTest,
  logoutUserTest,
  registerUserTest,
  resendEmailConfirmationCodeTest,
  sendCodeRecoveryPasswordTest,
  updatePasswordTest,
} from './auth-public.helpers';
import { createErrorsMessageTest } from '../../helpers/errors-message.helper';
import { createUserTest } from '../../super-admin/users/users-sa.helpers';
import { Connection, DataSource } from 'typeorm';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import { startApp } from '../../test.utils';
import {
  createCorrectUserTest,
  loginCorrectUserTest,
} from '../../helpers/chains-of-requests.helpers';

describe('Auth (Public); /auth', () => {
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

  let busyEmail;
  let busyLogin;
  const freeCorrectEmail = 'freeEmail@gmail.com';
  const freeCorrectLogin = 'freeLogin';
  const correctPass = 'correctPass1';
  let emailConfirmationCode;

  const lengthIs5 = '12345';
  const lengthIs21 = '123456789123456789123';
  //todo проверить jwt token
  describe(`/auth/me (GET) - get user info`, () => {
    let user;
    let accessToken;

    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createUserTest(
        httpServer,
        freeCorrectLogin,
        correctPass,
        freeCorrectEmail,
      );
      expect(user.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

      const result = await loginUserTest(
        httpServer,
        user.body.login,
        correctPass,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      accessToken = result.body.accessToken;
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await getCurrentUserInfoTest(httpServer, 'IncorrectJWT');
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) should return user info`, async () => {
      //successfully
      const result = await getCurrentUserInfoTest(httpServer, accessToken);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual({
        email: user.body.email,
        login: user.body.login,
        userId: user.body.id,
      });
    });
  });

  describe('/auth/registration (POST) - Registration flow', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    beforeAll(async () => {
      await deleteAllDataTest(httpServer);
    });

    it('+ (204) should register user successfully', async () => {
      const result = await registerUserTest(
        httpServer,
        'Egor123',
        correctPass,
        'meschit9@gmail.com',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      expect(emailAdapterMock.sendEmailConfirmationMessage).toBeCalled();

      busyEmail = 'meschit9@gmail.com';
      busyLogin = 'Egor123';
    });

    //dependent
    it(`- (400) should not register if user with the given login already exists,
              - (400) should not register if user with the given email already exists`, async () => {
      //busy login
      const result1 = await registerUserTest(
        httpServer,
        busyLogin,
        correctPass,
        freeCorrectEmail,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);

      expect(emailAdapterMock.sendEmailConfirmationMessage).not.toBeCalled();

      //busy email
      const result2 = await registerUserTest(
        httpServer,
        freeCorrectLogin,
        correctPass,
        busyEmail,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);

      expect(emailAdapterMock.sendEmailConfirmationMessage).not.toBeCalled();
    });

    it(`- (400) should not register if input data is incorrect (small length of login and pass),
              - (400) should not register if input data is incorrect (big length of login),
              - (400) should not register if input data is incorrect (incorrect pattern login and email, big pass),`, async () => {
      const result1 = await registerUserTest(
        httpServer,
        'No',
        'Leng5',
        freeCorrectEmail,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(
        createErrorsMessageTest(['login', 'password']),
      );

      expect(emailAdapterMock.sendEmailConfirmationMessage).not.toBeCalled();

      const result2 = await registerUserTest(
        httpServer,
        'Length===11',
        correctPass,
        freeCorrectEmail,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['login']));

      const result3 = await registerUserTest(
        httpServer,
        'No-~^&*%',
        'length21IsMore20-----',
        'IncorrectEmail',
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result3.body).toEqual(
        createErrorsMessageTest(['login', 'email', 'password']),
      );
    });
  });

  describe(`/auth/registration-confirmation (POST) - Registration-confirmation`, () => {
    let userId;
    beforeEach(() => {
      jest.clearAllMocks();
    });

    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //register user
      const result = await registerUserTest(
        httpServer,
        freeCorrectLogin,
        correctPass,
        freeCorrectEmail,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
    });

    it(`+ (204) should confirm email successfully
               - (400) should not confirm email because of confirmation code is already been applied`, async () => {
      //find confirmation code
      const userInfo = await dataSource.query(
        `
        SELECT ec."confirmationCode" 
        FROM public."users" as u
            JOIN public."users_email_confirmation" as ec
            ON u."id" = ec."userId"
        WHERE u."login" = $1`,
        [freeCorrectLogin],
      );
      expect(userInfo[0]?.confirmationCode).toBeDefined();
      emailConfirmationCode = userInfo[0].confirmationCode;

      //confirm email
      const result1 = await confirmEmailTest(httpServer, emailConfirmationCode);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //code is already been applied
      const result2 = await confirmEmailTest(httpServer, emailConfirmationCode);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['code']));
    });

    it(`- (400) should not confirm email because of confirmation code is incorrect
               - (400) should not confirm email because of confirmation code is expired`, async () => {
      //incorrect code
      const result1 = await confirmEmailTest(
        httpServer,
        'incorrectConfirmationCode',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['code']));

      //expired code
      //register user
      const result4 = await registerUserTest(
        httpServer,
        'Login2',
        correctPass,
        'email2@mail.ru',
      );
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //change date of code expiration
      await dataSource.query(
        `
        UPDATE public."users_email_confirmation" as ec
        SET "expirationDate" = now()
        FROM public."users" as u
            WHERE u."login" = $1 AND ec."userId" = u."id"`,
        ['Login2'],
      );

      const result2 = await confirmEmailTest(httpServer, emailConfirmationCode);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['code']));
    });
  });

  describe(`/auth/registration-email-resending (POST) - Resend confirmation code on email for registration
                   /auth/registration-confirmation (POST)`, () => {
    let pastConfirmationCode;
    let newConfirmationCode;
    beforeEach(() => {
      jest.clearAllMocks();
    });

    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //register user
      const result = await registerUserTest(
        httpServer,
        freeCorrectLogin,
        correctPass,
        freeCorrectEmail,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //find confirmation code
      pastConfirmationCode = emailConfirmationCode;
    });

    it(`+ (204) should resend new code`, async () => {
      //resend new code
      const result = await resendEmailConfirmationCodeTest(
        httpServer,
        freeCorrectEmail,
      );

      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      expect(emailAdapterMock.sendEmailConfirmationMessage).toBeCalled();
    });

    //dependent
    it(`- (400) should not confirm email because it is past code (not new)
               + (204) should confirm email with new code`, async () => {
      //find current confirmation code
      const userInfo = await dataSource.query(
        `
        SELECT ec."confirmationCode" 
        FROM public."users" as u
            JOIN public."users_email_confirmation" as ec
            ON u."id" = ec."userId"
        WHERE u."login" = $1`,
        [freeCorrectLogin],
      );
      expect(userInfo[0]?.confirmationCode).toBeDefined();
      newConfirmationCode = userInfo[0]?.confirmationCode;

      //400 past code
      const result1 = await confirmEmailTest(httpServer, pastConfirmationCode);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['code']));

      //204 new code
      const result2 = await confirmEmailTest(httpServer, newConfirmationCode);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
    });

    //dependent
    it(`- (400) should not confirm email because it is already confirmed`, async () => {
      //400 email is already confirmed
      const result = await confirmEmailTest(httpServer, newConfirmationCode);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result.body).toEqual(createErrorsMessageTest(['code']));
    });

    it(`- (400) should not resend code because user with such email haven't registered
               - (400) should not resend code because email is incorrect`, async () => {
      const result1 = await resendEmailConfirmationCodeTest(
        httpServer,
        'NotExistingEmail@mail.ru',
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['email']));
      expect(emailAdapterMock.sendEmailConfirmationMessage).not.toBeCalled();

      const result2 = await resendEmailConfirmationCodeTest(
        httpServer,
        'incorrectEmail',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['email']));
      expect(emailAdapterMock.sendEmailConfirmationMessage).not.toBeCalled();
    });
  });

  describe(`/auth/login (POST) - login user
                   /auth/logout (POST) - logout user`, () => {
    let user;
    let accessToken;
    let refreshToken;

    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      user = await createUserTest(
        httpServer,
        freeCorrectLogin,
        correctPass,
        freeCorrectEmail,
      );
      expect(user.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
    });

    it(`+ (200) should login user with passed login
               + (200) should login user with passed email`, async () => {
      const result1 = await loginUserTest(
        httpServer,
        user.body.login,
        correctPass,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body.accessToken).toBeDefined();
      expect(result1.headers['set-cookie'][0]).toBeDefined();
      accessToken = result1.body.accessToken;
      refreshToken = result1.headers['set-cookie'][0];

      const result2 = await loginUserTest(
        httpServer,
        user.body.email,
        correctPass,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
    });

    it(`- (401) should not login user because login is incorrect
               - (401) should not login user because password is incorrect`, async () => {
      //incorrect login
      const result1 = await loginUserTest(
        httpServer,
        'IncorrectLogin',
        correctPass,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
      //incorrect pass
      const result2 = await loginUserTest(
        httpServer,
        user.body.login,
        'IncorrectPass',
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    //dependent
    it(`- (401) refreshToken is incorrect
               + (204) should logout user`, async () => {
      //incorrect refreshToken
      const result1 = await logoutUserTest(httpServer, 'IncorrectRefreshToken');
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //logout successfully
      const result2 = await logoutUserTest(httpServer, refreshToken);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
    });

    //dependent
    it(`- (401) shouldn't logout user because the user has already logged out
  and refresh token was deactivated `, async () => {
      //refreshToken was deactivated
      const result = await logoutUserTest(httpServer, refreshToken);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });
  });

  describe(`/auth/refresh-token (POST) - generate new pair of access and refresh tokens
                   (Addition) /auth/logout (POST) - logout user for checking deactivated refreshToken`, () => {
    let user;
    let pastRefreshToken;
    let newRefreshToken;
    let pastAccessToken;
    let newAccessToken;

    beforeAll(async () => {
      await deleteAllDataTest(httpServer);
      //create user
      await createCorrectUserTest(httpServer);
      //login user
      const result = await loginCorrectUserTest(httpServer);
      pastAccessToken = result.accessToken;
      pastRefreshToken = result.refreshToken;
    });

    it(`- (401) refresh token is invalid`, async () => {
      const result = await createNewRefreshAccessTokensTest(
        httpServer,
        'InvalidRefreshToken',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) should return new pair of access and refresh tokens`, async () => {
      //delay for the new token to return
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const result = await createNewRefreshAccessTokensTest(
        httpServer,
        pastRefreshToken,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body.accessToken).toBeDefined();
      expect(result.headers['set-cookie'][0]).toBeDefined();
      newAccessToken = result.body.accessToken;
      newRefreshToken = result.headers['set-cookie'][0];

      expect(pastRefreshToken).not.toBe(newRefreshToken);
      expect(pastAccessToken).not.toBe(newAccessToken);
    });

    //dependent
    it(`- (401) shouldn't logout user because past refresh token was deactivated
              - (204) should logout user with new refresh token`, async () => {
      //refresh token was deactivated
      const result1 = await logoutUserTest(httpServer, pastRefreshToken);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);

      //refresh token
      const result2 = await logoutUserTest(httpServer, newRefreshToken);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
    });
  });

  describe(`/auth/password-recovery (POST) - send code for recovery password
                   /auth/new-password (POST) - update password`, () => {
    let user;
    let pastRecoveryCode;
    let newRecoveryCode;
    beforeEach(() => {
      jest.clearAllMocks();
    });

    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create user
      user = await createUserTest(
        httpServer,
        freeCorrectLogin,
        correctPass,
        freeCorrectEmail,
      );
      expect(user.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
    });

    it(`- (400) shouldn't send code because email is incorrect`, async () => {
      const result = await sendCodeRecoveryPasswordTest(
        httpServer,
        'incorrectEmail@.ru',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result.body).toEqual(createErrorsMessageTest(['email']));
    });

    it(`+ (204) should return status 204 but not send code
                       if user with such email doesn't exist`, async () => {
      const result = await sendCodeRecoveryPasswordTest(
        httpServer,
        'NotExistEmail@mail.ru',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      expect(emailAdapterMock.sendEmailPasswordRecovery).not.toBeCalled();
    });

    it(`+ (204) should send 2 codes password recovery`, async () => {
      const result1 = await sendCodeRecoveryPasswordTest(
        httpServer,
        user.body.email,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      expect(emailAdapterMock.sendEmailPasswordRecovery).toBeCalled();

      //find recovery pass code
      const code = await dataSource.query(
        `
        SELECT pr."confirmationCode" 
        FROM public."users" as u
            JOIN public."users_password_recovery" as pr
            ON u."id" = pr."userId"
        WHERE u."login" = $1`,
        [user.body.login],
      );
      expect(code[0]?.confirmationCode).toBeDefined();
      pastRecoveryCode = code[0].confirmationCode;

      const result2 = await sendCodeRecoveryPasswordTest(
        httpServer,
        user.body.email,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      expect(emailAdapterMock.sendEmailPasswordRecovery).toBeCalled();

      //find recovery new pass code
      const newCode = await dataSource.query(
        `
        SELECT pr."confirmationCode" 
        FROM public."users" as u
            JOIN public."users_password_recovery" as pr
            ON u."id" = pr."userId"
        WHERE u."login" = $1`,
        [user.body.login],
      );
      expect(newCode[0]?.confirmationCode).toBeDefined();
      newRecoveryCode = newCode[0].confirmationCode;
    });

    //dependent
    it(`- (400) shouldn't update password because code is incorrect
               - (400) shouldn't update password because code is past (it was deactivated)`, async () => {
      const result1 = await updatePasswordTest(
        httpServer,
        'newPassword123',
        uuidv4(),
      );

      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(emailAdapterMock.sendEmailPasswordRecovery).not.toBeCalled();
      expect(result1.body).toEqual(createErrorsMessageTest(['recoveryCode']));

      const result2 = await updatePasswordTest(
        httpServer,
        'newPassword123',
        pastRecoveryCode,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(emailAdapterMock.sendEmailPasswordRecovery).not.toBeCalled();
      expect(result2.body).toEqual(createErrorsMessageTest(['recoveryCode']));
    });

    //dependent
    it(`+ (204) should update password with new code`, async () => {
      const result = await updatePasswordTest(
        httpServer,
        'newPassword123',
        newRecoveryCode,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
    });

    it(`- (400) shouldn't update password because new password is not string;
              - (400) shouldn't update password because length of new password is less 6;
              - (400) shouldn't update password because length of new password is more 20`, async () => {
      //new password is not string
      const result1 = await updatePasswordTest(
        httpServer,
        undefined,
        newRecoveryCode,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(emailAdapterMock.sendEmailPasswordRecovery).not.toBeCalled();
      expect(result1.body).toEqual(createErrorsMessageTest(['newPassword']));

      //length is less than 6;
      const result2 = await updatePasswordTest(
        httpServer,
        lengthIs5,
        newRecoveryCode,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['newPassword']));

      //length is more than 20;
      const result3 = await updatePasswordTest(
        httpServer,
        lengthIs21,
        newRecoveryCode,
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result3.body).toEqual(createErrorsMessageTest(['newPassword']));
    });

    it(`(Addition) + (204) should send code password recovery and change date of expiration of this code
              - (400) - shouldn't update password (because code is expired)`, async () => {
      const result1 = await sendCodeRecoveryPasswordTest(
        httpServer,
        user.body.email,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //change date of expiration
      await dataSource.query(
        `
        UPDATE public."users_password_recovery" as pr
          SET "expirationDate" = now()
        FROM public."users" as u
        WHERE u."login" = $1 AND pr."userId" = u."id"`,
        [user.body.login],
      );

      //400 code is expired
      const result2 = await updatePasswordTest(
        httpServer,
        'newPassword2',
        newRecoveryCode,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['recoveryCode']));
    });
  });
});
