import request from 'supertest';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { CommentsAndUsersIdType } from '../types/comments.types';
import { CreateCorrectCommentTestType } from '../../helpers/types/chains-of-requests.types';

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

export async function getCommentsOfPostTest(
  httpServer,
  postId,
  query?,
  accessToken?,
) {
  return request(httpServer)
    .get(`/hometask-nest/posts/${postId}/comments`)
    .set('Authorization', `Bearer ${accessToken}`)
    .query(query ?? '');
}

export async function getCommentByIdPublicTest(
  httpServer,
  commentId,
  accessToken?,
) {
  return request(httpServer)
    .get(`/hometask-nest/comments/${commentId}`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export async function updateCommentTest(
  httpServer,
  commentId,
  content,
  accessToken,
) {
  return request(httpServer)
    .put(`/hometask-nest/comments/${commentId}`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ content });
}

export async function updateStatusLikeOfCommentTest(
  httpServer,
  commentId,
  likeStatus,
  accessToken,
) {
  return request(httpServer)
    .put(`/hometask-nest/comments/${commentId}/like-status`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ likeStatus });
}

export async function deleteCommentTest(httpServer, commentId, accessToken) {
  return request(httpServer)
    .delete(`/hometask-nest/comments/${commentId}`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export async function createCorrectCommentTest(
  httpServer,
  postId,
  accessToken,
): Promise<CreateCorrectCommentTestType> {
  const comment = await createCommentTest(
    httpServer,
    postId,
    accessToken,
    'Correct content of comment',
  );
  expect(comment.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
  expect(comment.body.id).toBeDefined();

  return {
    id: comment.body.id,
    content: comment.body.content,
    userId: comment.body.commentatorInfo.userId,
  };
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

export function createResponseSingleComment(
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
export function createResponseCommentsOfPostTest(
  idsOfComments: Array<string> | number,
  arrOfLikesCount?: Array<number> | null,
  arrOfDislikesCount?: Array<number> | null,
  arrOfMyStatus?: Array<string> | null,
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

export async function create9CommentsBy3Users(
  httpServer,
  postId,
  accessTokens: [string, string, string],
  usersId: [string, string, string],
): Promise<CommentsAndUsersIdType> {
  const commentNumber = [
    'first',
    'second',
    'third',
    'fourth',
    'fifth',
    'sixth',
    'seventh',
    'eighth',
    'ninth',
  ];
  const commentsIdsInfo: any = [];
  let count = 0;
  for (const i of commentNumber) {
    const result = await createCommentTest(
      httpServer,
      postId,
      accessTokens[Math.floor(count / 3)],
      `Content ${count} of the ${i} comment`,
    );
    expect(result.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);
    commentsIdsInfo.push({
      id: result.body.id,
      userId: usersId[Math.floor(count / 3)],
    });
    count++;
  }
  return commentsIdsInfo;
}
