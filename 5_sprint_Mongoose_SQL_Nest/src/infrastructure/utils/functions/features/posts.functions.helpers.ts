import {
  NewestLikesType,
  PostDBType,
} from '../../../../features/posts/infrastructure/SQL/repository/posts.types.repositories';
import { PostViewType } from '../../../../features/posts/infrastructure/SQL/query.repository/posts.types.query.repository';
import { AllLikeStatusEnum, AllLikeStatusType } from '../../enums/like-status';

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
      myStatus:
        (AllLikeStatusEnum[postInfo.myStatus] as AllLikeStatusType) ?? 'None',
      newestLikes: postInfo.newestLikes ?? [],
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
