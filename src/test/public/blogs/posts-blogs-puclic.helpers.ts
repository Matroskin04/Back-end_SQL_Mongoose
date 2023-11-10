import request from 'supertest';

export async function getPostsOfBlogPublicTest(
  httpServer,
  blogId,
  accessToken?,
  query?,
) {
  return request(httpServer)
    .get(`/api/blogs/${blogId}/posts`)
    .set('Authorization', `Bearer ${accessToken}`)
    .query(query || '');
}

export function createResponseAllPostsTest(
  idsOfPosts: Array<string> | number,
  arrOfLikesCount?: Array<number> | null,
  arrOfDislikesCount?: Array<number> | null,
  arrOfMyStatus?: Array<string> | null,
  totalCount?: number,
  pagesCount?: number,
  page?: number,
  pageSize?: number,
  arrOfBlogNames?: Array<string>,
) {
  const allPosts: any = [];
  let count = 0;
  const limit = typeof idsOfPosts === 'number' ? idsOfPosts : idsOfPosts.length;

  for (let i = 0; i < limit; i++) {
    allPosts.push({
      id: idsOfPosts[i] ?? expect.any(String),
      title: expect.any(String),
      shortDescription: expect.any(String),
      content: expect.any(String),
      blogId: expect.any(String),
      blogName: arrOfBlogNames ? arrOfBlogNames[i] : expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: arrOfLikesCount ? arrOfLikesCount[count] : 0,
        dislikesCount: arrOfDislikesCount ? arrOfDislikesCount[count] : 0,
        myStatus: arrOfMyStatus ? arrOfMyStatus[count] : 'None',
        newestLikes: expect.any(Array),
      },
    });
    count++;
  }
  return {
    pagesCount: pagesCount ?? 1,
    page: page ?? 1,
    pageSize: pageSize ?? 10,
    totalCount: totalCount ?? 0,
    items: allPosts,
  };
}
