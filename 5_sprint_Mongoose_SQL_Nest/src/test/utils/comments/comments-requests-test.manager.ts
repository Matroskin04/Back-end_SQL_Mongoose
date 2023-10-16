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
      .get(`/hometask-nest/blogger/blogs/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .query(query);
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
};
