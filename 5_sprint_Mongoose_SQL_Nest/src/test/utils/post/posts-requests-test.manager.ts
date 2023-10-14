import request from 'supertest';
import { RouterPaths } from '../router-paths';

export const postsRequestsTestManager = {
  createPostSa: async function (
    httpServer,
    blogId,
    title,
    shortDescription,
    content,
    saLogin?,
    saPass?,
  ) {
    return request(httpServer)
      .post(RouterPaths.blogsSa + `/${blogId}/posts`)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
      .send({
        title,
        shortDescription,
        content,
      });
  },

  getAllPostsSa: async function (httpServer, blogId, saLogin?, saPass?) {
    return request(httpServer)
      .get(RouterPaths.blogsSa + `/${blogId}/posts`)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty');
  },

  updatePostSa: async function (
    httpServer,
    blogId,
    postId,
    title,
    shortDescription,
    content,
    saLogin?,
    saPass?,
  ) {
    return request(httpServer)
      .put(RouterPaths.blogsSa + `/${blogId}/posts/${postId}`)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
      .send({
        title,
        shortDescription,
        content,
      });
  },

  deletePostSa: async function (httpServer, blogId, postId, saLogin?, saPass?) {
    return request(httpServer)
      .delete(RouterPaths.blogsSa + `/${blogId}/posts/${postId}`)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty');
  },
};
