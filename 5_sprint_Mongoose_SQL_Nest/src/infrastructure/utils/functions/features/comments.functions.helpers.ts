import { CommentViewType } from '../../../../features/comments/infrastructure/repository/comments.types.repositories';
import { CommentDBType } from '../../../../features/comments/domain/comments.db.types';
import { ObjectId } from 'mongodb';
import { LikesInfoQueryRepository } from '../../../../features/likes-info/infrastructure/query.repository/likes-info.query.repository';
import { StatusOfLike } from '../../../../features/comments/infrastructure/query.repository/comments.types.query.repository';
import { CommentOfBloggerFuncType } from '../types/comments-functions-types';
import { PostModelType } from '../../../../features/posts/domain/posts.db.types';
import { PostsQueryRepository } from '../../../../features/posts/infrastructure/query.repository/posts.query.repository';
import { NotFoundException } from '@nestjs/common';

export function modifyComment(
  comment: any,
  myStatus: StatusOfLike,
): CommentViewType {
  return {
    id: comment._id,
    content: comment.content,
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    },
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      myStatus,
    },
  };
}

export async function modifyCommentsOfPost(
  comment: CommentDBType,
  userId: ObjectId | null,
  likesInfoQueryRepository: LikesInfoQueryRepository,
): Promise<CommentViewType> {
  let myStatus: StatusOfLike = 'None';

  if (userId) {
    const likeInfo =
      await likesInfoQueryRepository.getLikesInfoByCommentAndUser(
        comment._id.toString(),
        userId.toString(),
      );
    if (likeInfo) {
      myStatus = likeInfo.statusLike;
    }
  }

  return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    },
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      myStatus: myStatus,
    },
  };
}

export async function modifyCommentsOfBlogger(
  comment: CommentDBType,
  userId: ObjectId | null,
  likesInfoQueryRepository: LikesInfoQueryRepository,
  postsQueryRepository: PostsQueryRepository, //todo конкретную фукнцию
): Promise<CommentOfBloggerFuncType> {
  let myStatus: StatusOfLike = 'None';

  if (userId) {
    const likeInfo =
      await likesInfoQueryRepository.getLikesInfoByCommentAndUser(
        comment._id.toString(),
        userId.toString(),
      );
    if (likeInfo) {
      myStatus = likeInfo.statusLike;
    }
  }

  const post = await postsQueryRepository.getPostMainInfoById(
    new ObjectId(comment.postId),
  );
  if (!post) throw new NotFoundException('Post of the comment is not found');

  return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    },
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: comment.likesInfo.likesCount,
      dislikesCount: comment.likesInfo.dislikesCount,
      myStatus: myStatus,
    },
    postInfo: {
      id: post._id.toString(),
      title: post.title,
      blogId: post.blogId,
      blogName: post.blogName,
    },
  };
}
