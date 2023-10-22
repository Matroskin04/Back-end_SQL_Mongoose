import request from 'supertest';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { PostsAndUsersIdType } from '../types/posts.types';

export async function getPostByIdPublicTest(httpServer, postId, accessToken?) {
  return request(httpServer)
    .get(`/hometask-nest/posts/${postId}`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export async function getPostsPublicTest(httpServer, query?, accessToken?) {
  return request(httpServer)
    .get(`/hometask-nest/posts`)
    .set('Authorization', `Bearer ${accessToken}`)
    .query(query ?? '');
}

export async function updateStatusLikeOfPostTest(
  httpServer,
  postId,
  likeStatus,
  accessToken,
) {
  return request(httpServer)
    .put(`/hometask-nest/posts/${postId}/like-status`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ likeStatus });
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
  myStatus?: 'Like' | 'Dislike',
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
