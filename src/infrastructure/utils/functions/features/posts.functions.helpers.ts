import {
  NewestLikesType,
  PostDBType,
} from '../../../../features/posts/infrastructure/SQL/repository/posts.types.repositories';
import { PostViewType } from '../../../../features/posts/infrastructure/SQL/query.repository/posts.types.query.repository';
import { AllLikeStatusEnum } from '../../enums/like-status.enums';
import { AllLikeStatusType } from '../../../types/like-status.general.types';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from '../../../../configuration/configuration';
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
    images: {
      main: [],
    },
  };
}

export function modifyPostIntoViewModel(
  postInfo: PostRawType,
  configService: ConfigService<ConfigType>,
): PostViewType {
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
    images: {
      main:
        postInfo.mainImages.map((image) => ({
          ...image,
          url: configService.get('S3', { infer: true })!.URL + image.url,
        })) ?? [],
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
  mainImages: Array<{
    url: 'string';
    width: number;
    height: number;
    fileSize: number;
  }>;
};
