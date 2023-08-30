import {
  NewestLikesType,
  PostDBType,
  PostTypeWithId,
} from '../../../../features/posts/infrastructure/repository/posts.types.repositories';
import { PostDBTypeMongo } from '../../../../features/posts/domain/posts.db.types';
import { PostViewType } from '../../../../features/posts/infrastructure/query.repository/posts.types.query.repository';
import { ObjectId } from 'mongodb';
import { LikesInfoQueryRepository } from '../../../../features/likes-info/infrastructure/query.repository/likes-info.query.repository';
import { reformNewestLikes } from './likes-info.functions.helpers';
import { AllLikeStatusEnum, AllLikeStatusType } from '../../enums/like-status';

export function modifyPostIntoViewModelMongo(
  post: PostDBTypeMongo,
  newestLikes: NewestLikesType,
  myStatus: 'None' | 'Like' | 'Dislike',
): PostViewType {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: post.likesInfo.likesCount,
      dislikesCount: post.likesInfo.dislikesCount,
      myStatus,
      newestLikes,
    },
  };
}

export function modifyPostIntoInitialViewModel(
  post: PostDBType,
  blogName: string,
  newestLikes: NewestLikesType,
  myStatus: 'None' | 'Like' | 'Dislike',
): PostViewType {
  return {
    id: post.id,
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus,
      newestLikes,
    },
  };
}

export function modifyPostIntoViewModel(postInfo: PostRawType): PostViewType {
  return {
    id: postInfo.id,
    title: postInfo.title,
    shortDescription: postInfo.shortDescription,
    content: postInfo.content,
    blogId: postInfo.blogId,
    blogName: postInfo.blogName,
    createdAt: postInfo.createdAt,
    extendedLikesInfo: {
      likesCount: +postInfo.likesCount,
      dislikesCount: +postInfo.dislikesCount,
      myStatus: AllLikeStatusEnum[postInfo.myStatus] as AllLikeStatusType,
      newestLikes: postInfo.newestLikes,
    },
  };
}
//todo export type
type PostRawType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  count: string;
  likesCount: string;
  dislikesCount: string;
  myStatus: AllLikeStatusEnum;
  newestLikes: Array<{
    login: string;
    userId: string;
    addedAt: string;
  }>;
};
