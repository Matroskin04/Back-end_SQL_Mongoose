import request from 'supertest';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { createPostTest } from '../../blogger/blogs/posts-blogs-blogger.helpers';
import { PostsAndUsersIdType } from '../types/posts.types';

export async function getPostByIdPublicTest(httpServer, postId, accessToken?) {
  return request(httpServer)
    .get(`/hometask-nest/posts/${postId}`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export async function getPostsPublicTest(httpServer, accessToken?) {
  return request(httpServer)
    .get(`/hometask-nest/posts`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export async function create9PostsOf3BlogsBy3Users(
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
    const result = await createPostTest(
      httpServer,
      blogsId[Math.floor(count / 3)],
      accessTokens[Math.floor(count / 3)],
      `Title ${i}`,
      `ShortDescription ${i}`,
      `Content ${i}`,
    );
    expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
    postsIdsInfo.push({
      id: result.body.id,
      userId: usersId[Math.floor(count / 3)],
    });
    count++;
  }
  return postsIdsInfo;
}

export function createResponseSinglePost(
  id?,
  title?,
  shortDescription?,
  content?,
  blogId?,
  blogName?,
  likesCount?: number,
  dislikesCount?: number,
  myStatus?: number,
) {
  return {
    id: id ?? expect.any(String),
    title: title ?? expect.any(String),
    shortDescription: shortDescription ?? expect.any(String),
    content: content ?? expect.any(String),
    blogId: blogId ?? expect.any(String),
    blogName: blogName ?? expect.any(String),
    createdAt: expect.any(String),
    extendedLikesInfo: {
      likesCount: likesCount ?? 0,
      dislikesCount: dislikesCount ?? 0,
      myStatus: myStatus ?? 'None',
      newestLikes: expect.any(Array),
    },
  };
}
