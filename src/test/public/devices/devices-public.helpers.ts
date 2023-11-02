import request from 'supertest';

export async function getDevicesPublicTest(httpServer, refreshToken) {
  return request(httpServer)
    .get(`/hometask-nest/security/devices`)
    .set('Cookie', refreshToken);
}

export async function deleteDevicesExcludeCurrentTest(
  httpServer,
  refreshToken,
) {
  return request(httpServer)
    .delete(`/hometask-nest/security/devices`)
    .set('Cookie', refreshToken);
}

export async function deleteDeviceByIdTest(httpServer, refreshToken, deviceId) {
  return request(httpServer)
    .delete(`/hometask-nest/security/devices/${deviceId}`)
    .set('Cookie', refreshToken);
}

export function createResponseDevicesTest(number) {
  const allDevices: any = [];

  for (let i = 1; i <= number; i++) {
    allDevices.push({
      ip: expect.any(String),
      title: expect.any(String),
      lastActiveDate: expect.any(String),
      deviceId: expect.any(String),
    });
  }
  return allDevices;
}
