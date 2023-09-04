import request from 'supertest';

export async function getBlogByIdPublicTest(httpServer, blogId, accessToken) {
  return request(httpServer)
    .get(`/hometask-nest/blogs/${blogId}`)
    .set('Authorization', `Bearer ${accessToken}`);
}
