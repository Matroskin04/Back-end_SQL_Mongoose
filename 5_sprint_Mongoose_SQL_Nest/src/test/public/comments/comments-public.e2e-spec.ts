import { INestApplication } from '@nestjs/common';
import { deleteAllDataTest } from '../../helpers/delete-all-data.helper';
import { v4 as uuidv4 } from 'uuid';
import {
  createCorrectBlogTest,
  createCorrectPostTest,
  createCorrectUserTest,
  loginCorrectUserTest,
} from '../../helpers/chains-of-requests.helpers';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import {
  createCorrectCommentTest,
  createResponseSingleComment,
  deleteCommentTest,
  getCommentByIdPublicTest,
  updateCommentTest,
  updateStatusLikeOfCommentTest,
} from './comments-public.helpers';
import { createUserTest } from '../../super-admin/users/users-sa.helpers';
import { loginUserTest } from '../auth/auth-public.helpers';
import { createErrorsMessageTest } from '../../helpers/errors-message.helper';
import { startApp } from '../../test.utils';
import { createAndLogin3UsersTest } from '../blogs/blogs-public.helpers';

describe('Comments, Put-like comment, (Public); /', () => {
  jest.setTimeout(5 * 60 * 1000);

  //vars for starting app and testing
  let app: INestApplication;
  let httpServer;

  beforeAll(async () => {
    const info = await startApp();
    app = info.app;
    httpServer = info.httpServer;
  });

  afterAll(async () => {
    await httpServer.close();
    await app.close();
  });
  let user;
  const correctPass = 'Password1';
  let post;
  let blog;
  let comment;
  let accessToken1;
  let accessToken2;
  let accessToken3;
  let accessToken4;
  let postsIds;
  let commentsIds;

  //comments
  const correctCommentContent = 'Correct comment content';
  const newCommentContent = 'New content of the comment';

  //incorrectData comments
  const contentLength301 = 'a'.repeat(301);
  const contentLength19 = 'a'.repeat(19);

  describe(`/comments/:id (GET) - get comment by id`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login user
      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken1 = result.accessToken;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
      post = await createCorrectPostTest(httpServer, blog.id, accessToken1);
      comment = await createCorrectCommentTest(
        httpServer,
        post.id,
        accessToken1,
      );
    });

    it(`- (404) should not find comment by id`, async () => {
      const result = await getCommentByIdPublicTest(httpServer, uuidv4());
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`+ (200) should return comment by id (without jwt)`, async () => {
      const result = await getCommentByIdPublicTest(httpServer, comment.id);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      expect(result.body).toEqual(
        createResponseSingleComment(
          comment.id,
          comment.content,
          comment.userId,
        ),
      );
    });
  });

  describe(`/comments/:id (PUT) - update comment by id`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login user
      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken1 = result.accessToken;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
      post = await createCorrectPostTest(httpServer, blog.id, accessToken1);
      comment = await createCorrectCommentTest(
        httpServer,
        post.id,
        accessToken1,
      );
    });
    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await updateCommentTest(
        httpServer,
        comment.id,
        newCommentContent,
        'IncorrectJWT',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) comment with such id is not found`, async () => {
      const result = await updateCommentTest(
        httpServer,
        uuidv4(),
        newCommentContent,
        accessToken1,
      );
      console.log(result.body);
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`- (403) shouldn't update comment if it doesn't belong to current user`, async () => {
      //creates new user
      const newUser = await createUserTest(
        httpServer,
        'user2',
        correctPass,
        'email2@gmail.com',
      );
      expect(newUser.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

      const result1 = await loginUserTest(
        httpServer,
        newUser.body.login,
        correctPass,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      const accessToken2 = result1.body.accessToken;

      //403 (update comment that doesn't belong this user)
      const result2 = await updateCommentTest(
        httpServer,
        comment.id,
        newCommentContent,
        accessToken2,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);
    });

    it(`- (400) value of 'content' is incorrect (small length)
              - (400) value of 'content' is incorrect (large length)`, async () => {
      const result1 = await updateCommentTest(
        httpServer,
        comment.id,
        contentLength19,
        accessToken1,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result1.body).toEqual(createErrorsMessageTest(['content']));

      const result2 = await updateCommentTest(
        httpServer,
        comment.id,
        contentLength301,
        accessToken1,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result2.body).toEqual(createErrorsMessageTest(['content']));
    });

    it(`+ (204) should delete comment
              (Addition) - (404) content of comment should be changed`, async () => {
      const result = await updateCommentTest(
        httpServer,
        comment.id,
        newCommentContent,
        accessToken1,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check that comment is updated
      const result2 = await getCommentByIdPublicTest(httpServer, comment.id);
      expect(result2.body.content).toEqual(newCommentContent);
    });
  });

  describe(`/comments/:id (DELETE) - delete comment by id`, () => {
    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login user
      user = await createCorrectUserTest(httpServer);
      const result = await loginCorrectUserTest(httpServer);
      accessToken1 = result.accessToken;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
      post = await createCorrectPostTest(httpServer, blog.id, accessToken1);
      comment = await createCorrectCommentTest(
        httpServer,
        post.id,
        accessToken1,
      );
    });
    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await deleteCommentTest(
        httpServer,
        comment.id,
        'IncorrectJWT',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) comment with such id is not found`, async () => {
      const result = await deleteCommentTest(
        httpServer,
        uuidv4(),
        accessToken1,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`- (403) shouldn't delete comment if it doesn't belong to current user`, async () => {
      //creates new user
      const newUser = await createUserTest(
        httpServer,
        'user2',
        correctPass,
        'email2@gmail.com',
      );
      expect(newUser.statusCode).toBe(HTTP_STATUS_CODE.CREATED_201);

      const result1 = await loginUserTest(
        httpServer,
        newUser.body.login,
        correctPass,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.OK_200);
      const accessToken2 = result1.body.accessToken;

      //403 (delete comment that doesn't belong this user)
      const result2 = await deleteCommentTest(
        httpServer,
        comment.id,
        accessToken2,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.FORBIDDEN_403);
    });

    it(`+ (204) should delete comment
              (Addition) - (404) deleted comment shouldn't be found`, async () => {
      const result = await deleteCommentTest(
        httpServer,
        comment.id,
        accessToken1,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      //check that comment is deleted
      const result2 = await getCommentByIdPublicTest(httpServer, comment.id);
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });
  });

  describe(`/comments/:id/like-status (PUT) - update like status of a comment
                  (Addition) /comments (GET) - get all comments
                  (Addition) /comments/:id (GET) - get comment by id`, () => {
    let userId1;
    let userId2;
    let userId3;
    let userId4;
    let correctCommentId;

    beforeAll(async () => {
      await deleteAllDataTest(httpServer);

      //create and login user
      const result = await createAndLogin3UsersTest(httpServer);
      accessToken1 = result[0].accessToken;
      accessToken2 = result[1].accessToken;
      accessToken3 = result[2].accessToken;
      userId1 = result[0].userId;
      userId2 = result[1].userId;
      userId3 = result[2].userId;

      //4 login
      user = await createCorrectUserTest(httpServer);
      const result2 = await loginCorrectUserTest(httpServer);
      accessToken4 = result2.accessToken;
      userId4 = user.id;

      blog = await createCorrectBlogTest(httpServer, accessToken1);
      post = await createCorrectPostTest(httpServer, blog.id, accessToken1);
      comment = await createCorrectCommentTest(
        httpServer,
        post.id,
        accessToken1,
      );
      correctCommentId = comment.id;
    });

    it(`- (401) jwt access token is incorrect`, async () => {
      //jwt is incorrect
      const result = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Like',
        'IncorrectJWT',
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.UNAUTHORIZED_401);
    });

    it(`- (404) comment with such id is not found`, async () => {
      const result = await updateStatusLikeOfCommentTest(
        httpServer,
        uuidv4(),
        'Like',
        accessToken1,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.NOT_FOUND_404);
    });

    it(`- (400) value of likeStatus should be one of 'None'/'Like'/'Dislike'`, async () => {
      const result = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Incorrect',
        accessToken1,
      );
      expect(result.statusCode).toBe(HTTP_STATUS_CODE.BAD_REQUEST_400);
      expect(result.body).toEqual(createErrorsMessageTest(['likeStatus']));
    });

    //check count of likes/dislikes changing
    it(`+ (204) should Like comment by user1
              + (204) should None comment by user1
              + (204) should Dislike comment by user1
              + (204) should None comment by user1`, async () => {
      //Like and check
      const result1 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Like',
        accessToken1,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkComment1 = await getCommentByIdPublicTest(
        httpServer,
        correctCommentId,
        accessToken1,
      );
      expect(checkComment1.body).toEqual(
        createResponseSingleComment(
          correctCommentId,
          null,
          null,
          null,
          1,
          0,
          'Like',
        ),
      );

      //None and check
      const result2 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'None',
        accessToken1,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkComment2 = await getCommentByIdPublicTest(
        httpServer,
        correctCommentId,
        accessToken1,
      );
      expect(checkComment2.body).toEqual(
        createResponseSingleComment(correctCommentId, null, null, null, 0, 0),
      );

      //Dislike and check
      const result3 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Dislike',
        accessToken1,
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkComment3 = await getCommentByIdPublicTest(
        httpServer,
        correctCommentId,
        accessToken1,
      );
      expect(checkComment3.body).toEqual(
        createResponseSingleComment(
          correctCommentId,
          null,
          null,
          null,
          0,
          1,
          'Dislike',
        ),
      );

      //None and check
      const result4 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'None',
        accessToken1,
      );
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkComment4 = await getCommentByIdPublicTest(
        httpServer,
        correctCommentId,
        accessToken1,
      );
      expect(checkComment4.body).toEqual(
        createResponseSingleComment(correctCommentId, null, null, null, 0, 0),
      );
    });

    //check count of likes/dislikes changing
    it(`+ (204) should Like 2 times comment by user1 (number of likes should increase by 1)
              + (204) should Dislike 2 times comment by user1 (number of Dislikes should increase by 1)
              + (204) should Like comment by user1`, async () => {
      //Like and check
      const result1 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Like',
        accessToken1,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      const result12 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Like',
        accessToken1,
      );
      expect(result12.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkComment1 = await getCommentByIdPublicTest(
        httpServer,
        correctCommentId,
        accessToken1,
      );
      expect(checkComment1.body).toEqual(
        createResponseSingleComment(
          correctCommentId,
          null,
          null,
          null,
          1,
          0,
          'Like',
        ),
      );

      //Dislike and check
      const result2 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Dislike',
        accessToken1,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      const result22 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Dislike',
        accessToken1,
      );
      expect(result22.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkComment2 = await getCommentByIdPublicTest(
        httpServer,
        correctCommentId,
        accessToken1,
      );
      expect(checkComment2.body).toEqual(
        createResponseSingleComment(
          correctCommentId,
          null,
          null,
          null,
          0,
          1,
          'Dislike',
        ),
      );

      //Like and check
      const result3 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Like',
        accessToken1,
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkComment3 = await getCommentByIdPublicTest(
        httpServer,
        correctCommentId,
        accessToken1,
      );
      expect(checkComment3.body).toEqual(
        createResponseSingleComment(
          correctCommentId,
          null,
          null,
          null,
          1,
          0,
          'Like',
        ),
      );
    });

    //check likes logic with several users
    it(`(Addition) + (200) should return comment
              + (204) should Like comment by user1 (number of likes = 1)
              + (204) should Like comment by user2 (number of likes = 2)
              + (204) should Like comment by user3 (number of likes = 3)
              + (204) should Dislike comment by user4 (number of dislikes = 1)
              + (204) should Dislike comment by user3 (number of likes = 2, dislikes = 2)`, async () => {
      //Like by user1 and check
      const result1 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Like',
        accessToken1,
      );
      expect(result1.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      //check without jwt (status like should be 'None')
      const checkComment1 = await getCommentByIdPublicTest(
        httpServer,
        correctCommentId,
      );
      expect(checkComment1.body).toEqual(
        createResponseSingleComment(correctCommentId, null, null, null, 1, 0),
      );

      //Like by user2 and check
      const result2 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Like',
        accessToken2,
      );
      expect(result2.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);
      //check without jwt (status like should be 'None')
      const checkComment2 = await getCommentByIdPublicTest(
        httpServer,
        correctCommentId,
      );
      expect(checkComment2.body.likesInfo.likesCount).toBe(2);
      expect(checkComment2.body.likesInfo.myStatus).toBe('None');

      //Like by user3 and check
      const result3 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Like',
        accessToken3,
      );
      expect(result3.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkPost3 = await getCommentByIdPublicTest(
        httpServer,
        correctCommentId,
        accessToken3,
      );
      expect(checkPost3.body.likesInfo.likesCount).toBe(3);
      expect(checkPost3.body.likesInfo.myStatus).toBe('Like');

      //Dislike by user4 and check
      const result4 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Dislike',
        accessToken4,
      );
      expect(result4.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkComment4 = await getCommentByIdPublicTest(
        httpServer,
        correctCommentId,
        accessToken4,
      );
      expect(checkPost3.body.likesInfo.likesCount).toBe(3);
      expect(checkComment4.body.likesInfo.dislikesCount).toBe(1);
      expect(checkComment4.body.likesInfo.myStatus).toBe('Dislike');

      //Dislike by user3 and check
      const result5 = await updateStatusLikeOfCommentTest(
        httpServer,
        correctCommentId,
        'Dislike',
        accessToken3,
      );
      expect(result5.statusCode).toBe(HTTP_STATUS_CODE.NO_CONTENT_204);

      const checkComment5 = await getCommentByIdPublicTest(
        httpServer,
        correctCommentId,
        accessToken3,
      );
      expect(checkComment5.body.likesInfo.likesCount).toBe(2);
      expect(checkComment5.body.likesInfo.dislikesCount).toBe(2);
      expect(checkComment5.body.likesInfo.myStatus).toBe('Dislike');
    });
  });
});
