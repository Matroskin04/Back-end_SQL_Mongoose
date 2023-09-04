import request from 'supertest';

export async function getPostByIdPublicTest(httpServer, postId, accessToken) {
  return request(httpServer)
    .get(`/hometask-nest/posts/${postId}`)
    .set('Authorization', `Bearer ${accessToken}`);
}
