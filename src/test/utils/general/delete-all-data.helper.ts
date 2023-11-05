import request from 'supertest';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';

export async function deleteAllDataTest(httpServer) {
  await request(httpServer)
    .delete('/api/testing/all-data')
    .expect(HTTP_STATUS_CODE.NO_CONTENT_204);
}
