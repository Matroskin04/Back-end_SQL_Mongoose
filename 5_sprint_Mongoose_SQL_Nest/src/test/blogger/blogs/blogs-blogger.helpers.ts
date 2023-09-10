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
  idsOfBlogs: Array<string> | number,
  isMembership?: boolean[] | null,
  totalCount?: number,
  pagesCount?: number,
  page?: number,
  pageSize?: number,
) {
  const allBlogs: any = [];
  const limit = typeof idsOfBlogs === 'number' ? idsOfBlogs : idsOfBlogs.length;
  for (let i = 0; i < limit; i++) {
    allBlogs.push({
      id: idsOfBlogs[i] ?? expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      websiteUrl: expect.any(String),
      createdAt: expect.any(String),
      isMembership: isMembership ? isMembership[i] : false,
    });
  }
  return {
    pagesCount: pagesCount ?? 1,
    page: page ?? 1,
    pageSize: pageSize ?? 10,
    totalCount: totalCount ?? 0,
    items: allBlogs,
  };
}

export function createResponseSingleBlog(
  id?,
  name?,
  description?,
  websiteUrl?,
  isMembership?,
) {
  return {
    id: id ?? expect.any(String),
    name: name ?? expect.any(String),
    description: description ?? expect.any(String),
    websiteUrl: websiteUrl ?? expect.any(String),
    createdAt: expect.any(String),
    isMembership: isMembership ?? false,
  };
}
