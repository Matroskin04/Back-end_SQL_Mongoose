import request from 'supertest';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';

export async function registerUserTest(
  httpServer,
  login: string,
  password: string,
  email: string,
) {
  return request(httpServer).post('/api/auth/registration').send({
    login,
    password,
    email,
  });
}

export async function confirmEmailTest(
  httpServer,
  confirmationCode: string | undefined,
) {
  return request(httpServer)
    .post(`/api/auth/registration-confirmation`)
    .send({
      code: confirmationCode ?? '',
    });
}

export async function loginUserTest(
  httpServer,
  loginOrEmail: any,
  password: any,
) {
  return request(httpServer)
    .post(`/api/auth/login`)
    .send({ loginOrEmail, password });
}

export async function logoutUserTest(httpServer, refreshToken: string) {
  return request(httpServer)
    .post('/api/auth/logout')
    .set('Cookie', refreshToken);
}

export async function getCurrentUserInfoTest(httpServer, accessToken: string) {
  return request(httpServer)
    .get(`/api/auth/me`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export async function resendEmailConfirmationCodeTest(
  httpServer,
  email: string,
) {
  return request(httpServer)
    .post(`/api/auth/registration-email-resending`)
    .send({ email });
}

export async function createNewRefreshAccessTokensTest(
  httpServer,
  refreshToken,
) {
  return request(httpServer)
    .post('/api/auth/refresh-token')
    .set('Cookie', refreshToken);
}

export async function sendCodeRecoveryPasswordTest(httpServer, email: string) {
  return request(httpServer)
    .post(`/api/auth/password-recovery`)
    .send({ email });
}

export async function updatePasswordTest(
  httpServer,
  newPassword,
  recoveryCode,
) {
  return request(httpServer)
    .post(`/api/auth/new-password`)
    .send({ newPassword, recoveryCode });
}
