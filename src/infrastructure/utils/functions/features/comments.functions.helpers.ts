import { CommentViewType } from '../../../../features/comments/infrastructure/SQL/repository/comments.types.repositories';
import { CommentDBType } from '../../../../features/comments/domain/comments.db.types';
import { StatusOfLike } from '../../../../features/comments/infrastructure/SQL/query.repository/comments.output.types.query.repository';
import { CommentOfBloggerFuncType } from '../types/comments.functions.types';
import { AllLikeStatusEnum } from '../../enums/like-status.enums';
import { AllLikeStatusType } from '../../../types/like-status.general.types';

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
    createdAt: commentInfo.createdAt,
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
    createdAt: commentInfo.createdAt,
    likesInfo: {
      likesCount: +commentInfo.likesCount,
      dislikesCount: +commentInfo.dislikesCount,
      myStatus:
        (AllLikeStatusEnum[commentInfo.myStatus] as AllLikeStatusType) ??
        'None',
    },
  };
}

//todo where type export
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
    createdAt: allInfo.createdAt,
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
