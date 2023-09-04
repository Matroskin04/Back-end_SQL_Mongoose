import request from 'supertest';

export async function createBlogTest(
  httpServer,
  accessToken: string,
  name,
  description,
  websiteUrl,
) {
  return request(httpServer)
    .post(`/hometask-nest/blogger/blogs`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      name,
      description,
      websiteUrl,
    });
}

export async function getAllBlogsBloggerTest(httpServer, accessToken, query) {
  return request(httpServer)
    .get(`/hometask-nest/blogger/blogs`)
    .set('Authorization', `Bearer ${accessToken}`)
    .query(query);
}

export async function updateBlogBloggerTest(
  httpServer,
  blogId,
  accessToken,
  name,
  description,
  websiteUrl,
) {
  return request(httpServer)
    .put(`/hometask-nest/blogger/blogs/${blogId}`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      name,
      description,
      websiteUrl,
    });
}

export async function deleteBlogBloggerTest(httpServer, blogId, accessToken) {
  return request(httpServer)
    .delete(`/hometask-nest/blogger/blogs/${blogId}`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export function createResponseAllBlogsTest(
  pagesCount,
  page,
  pageSize,
  totalCount,
  items,
) {
  return {
    pagesCount,
    page,
    pageSize,
    totalCount,
    items,
  };
}

export function createResponseSingleBlog(
  id,
  name,
  description,
  websiteUrl,
  isMembership?,
) {
  return {
    id,
    name,
    description,
    websiteUrl,
    createdAt: expect.any(String),
    isMembership: isMembership ?? false,
  };
}
