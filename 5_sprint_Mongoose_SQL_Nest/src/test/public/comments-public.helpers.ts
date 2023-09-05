import request from 'supertest';

export async function createCommentTest(
  httpServer,
  postId,
  accessToken,
  content,
) {
  return request(httpServer)
    .post(`/hometask-nest/posts/${postId}/comments`)

    .send({
      content,
    });
}

export async function getCommentsOfPostTest(httpServer, postId, accessToken?) {
  return request(httpServer)
    .get(`/hometask-nest/posts/${postId}/comments`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export function createResponseCommentsOfBlogger(
  idsOfComments: Array<string> | number,
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
  const limit =
    typeof idsOfComments === 'number' ? idsOfComments : idsOfComments.length;

  for (let i = 0; i < limit; i++) {
    allComments.push({
      id: idsOfComments[i] ?? expect.any(String),
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
    totalCount: totalCount ?? 0,
    items: allComments,
  };
}

export function createResponseSingleCommentTest(
  id?: string | null,
  content?: string | null,
  userId?: string | null,
  login?: string | null,
  likesCount?: number,
  dislikesCount?: number,
  myStatus?: string,
) {
  return {
    id: id ?? expect.any(String),
    content: content ?? expect.any(String),
    commentatorInfo: {
      userId: userId ?? expect.any(String),
      userLogin: login ?? expect.any(String),
    },
    createdAt: expect.any(String),
    likesInfo: {
      likesCount: likesCount ?? 0,
      dislikesCount: dislikesCount ?? 0,
      myStatus: myStatus ?? 'None',
    },
  };
}

// export function
