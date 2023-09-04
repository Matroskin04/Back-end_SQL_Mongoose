import request from 'supertest';

export async function getAllCommentsOfBloggerTest(httpServer, accessToken) {
  return request(httpServer)
    .get(`/hometask-nest/blogger/blogs/comments`)
    .set('Authorization', `Bearer ${accessToken}`);
}
