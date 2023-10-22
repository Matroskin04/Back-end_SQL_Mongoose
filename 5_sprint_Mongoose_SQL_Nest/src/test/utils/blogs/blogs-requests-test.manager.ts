import request from 'supertest';
import { RouterPaths } from '../router-paths';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';

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

  createBlogBlogger: async function (
    httpServer,
    accessToken: string,
    name?,
    description?,
    websiteUrl?,
  ) {
    return request(httpServer)
      .post(RouterPaths.blogsBlogger)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: name ?? 'correctName',
        description: description ?? 'correctShortDescription',
        websiteUrl:
          websiteUrl ?? 'https://www.mongodb.com/docs/manual/reference/method',
      });
  },

  create9BlogsBlogger: async function (
    httpServer,
    accessTokens: string,
  ): Promise<string[]> {
    const blogNumber = [
      'first',
      'second',
      'third',
      'fourth',
      'fifth',
      'sixth',
      'seventh',
      'eighth',
      'ninth',
    ];
    const blogsIds: any = [];
    let count = 1;
    for (const i of blogNumber) {
      const result = await this.createBlogBlogger(
        httpServer,
        accessTokens,
        `Name ${count} ${i}`,
        `Description ${i}`,
        `https://samurai.it-incubator.io`,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      blogsIds.push(result.body.id);
      count++;
    }
    return blogsIds.reverse();
  },

  getAllBlogsSa: async function (httpServer, query, saLogin?, saPass?) {
    return request(httpServer)
      .get(RouterPaths.blogsSa)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
      .query(query);
  },

  getAllBlogsBlogger: async function (httpServer, accessToken, query = '') {
    return request(httpServer)
      .get(RouterPaths.blogsBlogger)
      .set('Authorization', `Bearer ${accessToken}`)
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

  updateBlogBlogger: async function (
    httpServer,
    blogId,
    accessToken,
    name,
    description,
    websiteUrl,
  ) {
    return request(httpServer)
      .put(RouterPaths.blogsBlogger + `/${blogId}`)
      .set('Authorization', `Bearer ${accessToken}`)
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

  deleteBlogBlogger: async function (httpServer, blogId, accessToken) {
    return request(httpServer)
      .delete(RouterPaths.blogsBlogger + `/${blogId}`)
      .set('Authorization', `Bearer ${accessToken}`);
  },
};
