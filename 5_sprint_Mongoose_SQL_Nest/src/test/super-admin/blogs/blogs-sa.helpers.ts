import request from 'supertest';

export async function createBlogSaTest(
  httpServer,
  name,
  description,
  websiteUrl,
  saLogin?,
  saPass?,
) {
  return request(httpServer)
    .post(`/hometask-nest/sa/blogs`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
    .send({
      name,
      description,
      websiteUrl,
    });
}

export async function getAllBlogsSaTest(httpServer, query, saLogin?, saPass?) {
  return request(httpServer)
    .get(`/hometask-nest/blogger/blogs`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
    .query(query);
}

export async function updateBlogSaTest(
  httpServer,
  blogId,
  name,
  description,
  websiteUrl,
  saLogin?,
  saPass?,
) {
  return request(httpServer)
    .put(`/hometask-nest/blogger/blogs/${blogId}`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty')
    .send({
      name,
      description,
      websiteUrl,
    });
}

export async function deleteBlogSaTest(httpServer, blogId, saLogin?, saPass?) {
  return request(httpServer)
    .delete(`/hometask-nest/blogger/blogs/${blogId}`)
    .auth(saLogin ?? 'admin', saPass ?? 'qwerty');
}

export function createResponseAllBlogsSaTest(
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

export function createResponseSingleBlogSa(
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
