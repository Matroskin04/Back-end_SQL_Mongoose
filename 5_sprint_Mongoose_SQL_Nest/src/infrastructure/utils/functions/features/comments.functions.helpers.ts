import { CommentViewType } from '../../../../features/comments/infrastructure/repository/comments.types.repositories';
import {
  CommentDBType,
  CommentDBTypeMongo,
} from '../../../../features/comments/domain/comments.db.types';
import { ObjectId } from 'mongodb';
import { LikesInfoQueryRepository } from '../../../../features/likes-info/infrastructure/query.repository/likes-info.query.repository';
import { StatusOfLike } from '../../../../features/comments/infrastructure/query.repository/comments.types.query.repository';
import { CommentOfBloggerFuncType } from '../types/comments-functions-types';
import { PostModelType } from '../../../../features/posts/domain/posts.db.types';
import { PostsQueryRepository } from '../../../../features/posts/infrastructure/query.repository/posts.query.repository';
import { NotFoundException } from '@nestjs/common';
import { AllLikeStatusEnum, AllLikeStatusType } from '../../enums/like-status';

export function modifyCommentIntoInitialViewModel(
  commentInfo: CommentDBType,
  userLogin: string,
  myStatus: StatusOfLike,
): CommentViewType {
  return {
    id: commentInfo.id,
    content: commentInfo.content,
    commentatorInfo: {
      userId: commentInfo.userId,
      userLogin,
    },
    createdAt: new Date(commentInfo.createdAt).toISOString(),
    likesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus,
    },
  };
}

export function modifyCommentIntoViewModel(
  commentInfo: CommentRawInfoType,
): CommentViewType {
  return {
    id: commentInfo.id,
    content: commentInfo.content,
    commentatorInfo: {
      userId: commentInfo.userId,
      userLogin: commentInfo.userLogin,
    },
    createdAt: new Date(commentInfo.createdAt).toISOString(),
    likesInfo: {
      likesCount: +commentInfo.likesCount,
      dislikesCount: +commentInfo.dislikesCount,
      myStatus:
        (AllLikeStatusEnum[commentInfo.myStatus] as AllLikeStatusType) ??
        'None',
    },
  };
}

//todo type export
type CommentRawInfoType = {
  id: string;
  content: string;
  userId: string;
  userLogin: string;
  createdAt: string;
  likesCount: string;
  dislikesCount: string;
  myStatus: string;
};
export function modifyCommentsOfBlogger(
  allInfo: any,
): CommentOfBloggerFuncType {
  return {
    id: allInfo.id,
    content: allInfo.content,
    commentatorInfo: {
      userId: allInfo.userId,
      userLogin: allInfo.userLogin,
    },
    createdAt: new Date(allInfo.createdAt).toISOString(),
    likesInfo: {
      likesCount: +allInfo.likesCount,
      dislikesCount: +allInfo.dislikesCount,
      myStatus:
        (AllLikeStatusEnum[allInfo.myStatus] as AllLikeStatusType) ?? 'None',
    },
    postInfo: {
      id: allInfo.postId,
      title: allInfo.title,
      blogId: allInfo.blogId,
      blogName: allInfo.blogName,
    },
  };
}
