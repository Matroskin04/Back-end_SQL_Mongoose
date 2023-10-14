import request from 'supertest';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { RouterPaths } from '../router-paths';

export const blogsRequestsTestManager = {
  createBlogSa: async function (
    httpServer,
    name,
    description,
    websiteUrl,
    saLogin?,
    saPass?,
  ) {
    return request(httpServer)
      .post(RouterPaths.blogsSa)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
      .send({
        name,
        description,
        websiteUrl,
      });
  },

  getAllBlogsSa: async function (httpServer, query, saLogin?, saPass?) {
    return request(httpServer)
      .get(RouterPaths.blogsSa)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
      .query(query);
  },

  updateBlogSa: async function (
    httpServer,
    blogId,
    name,
    description,
    websiteUrl,
    saLogin?,
    saPass?,
  ) {
    return request(httpServer)
      .put(RouterPaths.blogsSa + `/${blogId}`)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
      .send({
        name,
        description,
        websiteUrl,
      });
  },

  deleteBlogSa: async function (httpServer, blogId, saLogin?, saPass?) {
    return request(httpServer)
      .delete(RouterPaths.blogsSa + `/${blogId}`)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty');
  },
};
