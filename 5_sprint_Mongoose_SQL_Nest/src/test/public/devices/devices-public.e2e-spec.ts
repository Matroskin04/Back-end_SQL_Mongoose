import { INestApplication } from '@nestjs/common';
import { startApp } from '../../test.utils';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import { createUserTest } from '../../super-admin/users/users-sa.helpers';
import { v4 as uuidv4 } from 'uuid';
import {
  createCorrectUserTest,
  loginCorrectUserTest,
} from '../../helpers/chains-of-requests.helpers';
import { loginUserTest } from '../auth/auth-public.helpers';
import {
  createResponseDevicesTest,
  deleteDeviceByIdTest,
  deleteDevicesExcludeCurrentTest,
  getDevicesPublicTest,
} from './devices-public.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';

describe('Posts (GET), Put-Like (Post), Comments (Public); /', () => {
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
  let user;
  let post;
  let blog;
  let refreshToken1;
  let refreshToken2;
  let refreshToken1_2;

  describe(`/devices (GET) - get all devices with active sessions`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //3 login by 1 user
      await createCorrectUserTest(httpServer);
      await loginCorrectUserTest(httpServer);
      await loginCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      refreshToken1 = result1.refreshToken;
      expect(refreshToken1).toBeDefined();

      //login by 2 user
      await createUserTest(httpServer, 'Login2', 'Password2', 'email2@mail.ru');
      const result2 = await loginUserTest(httpServer, 'Login2', 'Password2');
      refreshToken2 = result2.headers['set-cookie'][0];
      expect(refreshToken1).toBeDefined();
    });

    it(`- (401) jwt (refresh token) is incorrect`, async () => {
      const result = await getDevicesPublicTest(httpServer, 'IncorrectToken');
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`+ (200) should return 3 devices by user1
              + (200) should return 1 device by user2`, async () => {
      //3 devices
      const result1 = await getDevicesPublicTest(httpServer, refreshToken1);
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result1.body).toEqual(createResponseDevicesTest(3));

      //1 device
      const result2 = await getDevicesPublicTest(httpServer, refreshToken2);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result2.body).toEqual(createResponseDevicesTest(1));
    });
  });

  describe(`/devices (DELETE) - delete all devices exclude current`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //3 login by 1 user
      await createCorrectUserTest(httpServer);
      await loginCorrectUserTest(httpServer);
      await loginCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      refreshToken1 = result1.refreshToken;
      expect(refreshToken1).toBeDefined();
    });

    it(`- (401) jwt (refresh token) is incorrect`, async () => {
      const result = await deleteDevicesExcludeCurrentTest(
        httpServer,
        'IncorrectToken',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`(Addition) + (200) should return 3 devices by user1;
              + (204) should delete all devices exclude current;
              (Addition) + (200) should return 1 device by user1;`, async () => {
      //3 devices
      const result1 = await getDevicesPublicTest(httpServer, refreshToken1);
      expect(result1.body).toEqual(createResponseDevicesTest(3));

      //delete devices
      const result2 = await deleteDevicesExcludeCurrentTest(
        httpServer,
        refreshToken1,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //1 device
      const result3 = await getDevicesPublicTest(httpServer, refreshToken1);
      expect(result3.body).toEqual(createResponseDevicesTest(1));
    });
  });

  describe(`/devices/:id (DELETE) - delete the device by id`, () => {
    let deviceId1;
    let deviceId2;
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //login by 1 user
      await createCorrectUserTest(httpServer);
      const result1 = await loginCorrectUserTest(httpServer);
      refreshToken1 = result1.refreshToken;
      const result3 = await loginCorrectUserTest(httpServer);
      refreshToken1_2 = result3.refreshToken;
      expect(refreshToken1).toBeDefined();

      //deviceId of user1
      const devices1 = await getDevicesPublicTest(httpServer, refreshToken1);
      deviceId1 = devices1.body[0].deviceId;
      expect(deviceId1).toBeDefined();

      //login by 2 user
      await createUserTest(httpServer, 'Login2', 'Password2', 'email2@mail.ru');
      const result2 = await loginUserTest(httpServer, 'Login2', 'Password2');
      refreshToken2 = result2.headers['set-cookie'][0];
      expect(refreshToken1).toBeDefined();

      //deviceId of user2
      const devices2 = await getDevicesPublicTest(httpServer, refreshToken2);
      deviceId2 = devices2.body[0].deviceId;
      expect(deviceId2).toBeDefined();
    });

    it(`- (401) jwt (refresh token) is incorrect`, async () => {
      const result = await deleteDeviceByIdTest(
        httpServer,
        'IncorrectToken',
        deviceId1,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) device with such id is not found`, async () => {
      const result = await deleteDeviceByIdTest(
        httpServer,
        refreshToken1_2,
        uuidv4(),
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`- (403) delete device that belongs to another user`, async () => {
      const result = await deleteDeviceByIdTest(
        httpServer,
        refreshToken1_2,
        deviceId2,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);
    });

    it(`(Addition) + (200) should return 2 device by user1;
              + (204) should delete device by user1;
              (Addition) + (200) should return 1 device by user1;
              (Addition) - (401) unauthorized when do request with refresh of deletion device`, async () => {
      //2 device
      const result1 = await getDevicesPublicTest(httpServer, refreshToken1_2);
      expect(result1.body).toEqual(createResponseDevicesTest(2));

      //delete device by id
      const result2 = await deleteDeviceByIdTest(
        httpServer,
        refreshToken1_2,
        deviceId1,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //1 device
      const result3 = await getDevicesPublicTest(httpServer, refreshToken1_2);
      expect(result3.body).toEqual(createResponseDevicesTest(1));

      //unauthorized
      const result4 = await getDevicesPublicTest(httpServer, refreshToken1);
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });
  });
});
