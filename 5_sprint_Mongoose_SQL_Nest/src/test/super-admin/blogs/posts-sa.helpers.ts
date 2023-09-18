import request from 'supertest';

export async function createPostTest(
  httpServer,
  blogId,
  title,
  shortDescription,
  content,
  saLogin?,
  saPass?,
) {
  return request(httpServer)
    .post(`/hometask-nest/sa/blogs/${blogId}/posts`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
    .send({
      title,
      shortDescription,
      content,
    });
}

export async function getAllPostsTest(httpServer, blogId, saLogin?, saPass?) {
  return request(httpServer)
    .get(`/hometask-nest/sa/blogs/${blogId}/posts`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty');
}

export async function updatePostTest(
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
    .put(`/hometask-nest/sa/blogs/${blogId}/posts/${postId}`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
    .send({
      title,
      shortDescription,
      content,
    });
}

export async function deletePostTest(
  httpServer,
  blogId,
  postId,
  saLogin?,
  saPass?,
) {
  return request(httpServer)
    .delete(`/hometask-nest/sa/blogs/${blogId}/posts/${postId}`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty');
}

export function createResponseSinglePost(
  title,
  shortDescription,
  content,
  blogId,
) {
  return {
    id: expect.any(String),
    title,
    shortDescription,
    content,
    blogId,
    blogName: expect.any(String),
    createdAt: expect.any(String),
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: 'None',
      newestLikes: [],
    },
  };
}
