import request from 'supertest';
import { createBlogTest } from '../../blogger/blogs/blogs-blogger.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';

export async function getBlogByIdPublicTest(httpServer, blogId) {
  return request(httpServer).get(`/hometask-nest/blogs/${blogId}`);
}

export async function getAllBlogsPublicTest(httpServer) {
  return request(httpServer).get(`/hometask-nest/blogs`);
}

export async function create10BlogsBy3Users(
  httpServer,
  accessTokens: string[],
): Promise<string[]> {
  const blogNumber = [
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'sixth',
    'seventh',
    'eighth',
    'ninth',
    'tenth',
  ];
  const blogsIds: any = [];
  for (const i of blogNumber) {
    const result = await createBlogTest(
      httpServer,
      accessTokens[0],
      `Name ${i}`,
      `Description ${i}`,
      `https://samurai.it-incubator.io`,
    );
    expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
    blogsIds.push(result.body.id);
  }
  return blogsIds;
}
