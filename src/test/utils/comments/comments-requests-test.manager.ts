import request from 'supertest';
import { RouterPaths } from '../router-paths';
import { PostsAndUsersIdType } from '../../public/types/posts.types';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';

export const commentsRequestsTestManager = {
  getAllCommentsOfBlogger: async function (
    httpServer,
    accessToken,
    query = '',
  ) {
    return request(httpServer)
      .get(`/api/blogger/blogs/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .query(query);
  },
};
