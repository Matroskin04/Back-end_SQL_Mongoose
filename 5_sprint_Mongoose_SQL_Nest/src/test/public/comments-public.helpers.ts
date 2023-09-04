import request from 'supertest';

export async function createCommentTest(
  httpServer,
  postId,
  accessToken,
  content,
) {
  return request(httpServer)
    .post(`/hometask-nest/posts/${postId}/comments`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({
      content,
    });
}

export function createResponseCommentsOfBlogger(
  idsOfComments: Array<string | null>,
  idsOfPosts: Array<number> | null,
  arrOfLikesCount: Array<number> | null,
  arrOfDislikesCount: Array<number> | null,
  arrOfMyStatus: Array<string> | null,
  totalCount?: number,
  pagesCount?: number,
  page?: number,
  pageSize?: number,
) {
  const allComments: any = [];
  let count = 0;
  for (const id of idsOfComments) {
    allComments.push({
      id: id ?? expect.any(String),
      content: expect.any(String),
      commentatorInfo: {
        userId: expect.any(String),
        userLogin: expect.any(String),
      },
      createdAt: expect.any(String),
      likesInfo: {
        likesCount: arrOfLikesCount ? arrOfLikesCount[count] : 0,
        dislikesCount: arrOfDislikesCount ? arrOfDislikesCount[count] : 0,
        myStatus: arrOfMyStatus ? arrOfMyStatus[count] : 'None',
      },
      postInfo: {
        id: idsOfPosts ? idsOfPosts[count] : expect.any(String),
        title: expect.any(String),
        blogId: expect.any(String),
        blogName: expect.any(String),
      },
    });
    count++;
  }
  return {
    pagesCount: pagesCount ?? 1,
    page: page ?? 1,
    pageSize: pageSize ?? 10,
    totalCount: totalCount,
    items: allComments,
  };
}
