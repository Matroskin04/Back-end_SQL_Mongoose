import request from 'supertest';
import { RouterPaths } from '../router-paths';
import { PostsAndUsersIdType } from '../../public/types/posts.types';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';

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

  createPostBlogger: async function (
    httpServer,
    blogId,
    accessToken,
    title = 'correctTitle',
    shortDescription = 'correctShortDescription',
    content = 'correctContent',
  ) {
    return request(httpServer)
      .post(RouterPaths.blogsBlogger + `/${blogId}/posts`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title,
        shortDescription,
        content,
      });
  },

  create9PostsOf3BlogsBy3Users: async function (
    httpServer,
    blogsId: [string, string, string],
    accessTokens: [string, string, string],
    usersId: [string, string, string],
  ): Promise<PostsAndUsersIdType> {
    const postNumber = [
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
    const postsIdsInfo: any = [];
    let count = 0;
    for (const i of postNumber) {
      const result = await this.createPostBlogger(
        httpServer,
        blogsId[Math.floor(count / 3)],
        accessTokens[Math.floor(count / 3)],
        `Title ${count} ${i}`,
        `ShortDescription ${count} ${i}`,
        `Content ${count} ${i}`,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      postsIdsInfo.push({
        id: result.body.id,
        userId: usersId[Math.floor(count / 3)],
      });
      count++;
    }
    return postsIdsInfo;
  },

  create9PostsOfBlog: async function (
    httpServer,
    blogId: string,
    accessToken: string,
  ): Promise<string[]> {
    const postNumber = [
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
    const postsIds: any = [];
    let count = 1;
    for (const i of postNumber) {
      const result = await this.createPostBlogger(
        httpServer,
        blogId,
        accessToken,
        `Title ${count} ${i}`,
        `ShortDescription ${count} ${i}`,
        `Content ${count} ${i}`,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
      postsIds.push(result.body.id);
      count++;
    }
    return postsIds.reverse();
  },

  getAllPostsSa: async function (
    httpServer,
    blogId,
    query = '',
    saLogin?,
    saPass?,
  ) {
    return request(httpServer)
      .get(RouterPaths.blogsSa + `/${blogId}/posts`)
      .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
      .query(query);
  },

  getAllPostsBlogger: async function (
    httpServer,
    blogId,
    accessToken,
    query = '',
  ) {
    return request(httpServer)
      .get(RouterPaths.blogsBlogger + `/${blogId}/posts`)
      .set('Authorization', `Bearer ${accessToken}`)
      .query(query);
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

  updatePostBlogger: async function (
    httpServer,
    blogId,
    postId,
    accessToken,
    title,
    shortDescription,
    content,
  ) {
    return request(httpServer)
      .put(RouterPaths.blogsBlogger + `/${blogId}/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`)
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

  deletePostBlogger: async function (httpServer, blogId, postId, accessToken) {
    return request(httpServer)
      .delete(RouterPaths.blogsBlogger + `/${blogId}/posts/${postId}`)
      .set('Authorization', `Bearer ${accessToken}`);
  },
};
