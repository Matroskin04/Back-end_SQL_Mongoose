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

export function modifyPostIntoViewModelFirst(
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
  console.log(postInfo.likesCount);
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

export async function modifyPostForAllDocsMongo( //todo in repo
  post: PostDBTypeMongo,
  userId: ObjectId | null,
  likesInfoQueryRepository: LikesInfoQueryRepository,
): Promise<PostViewType> {
  let myStatus: 'Like' | 'Dislike' | 'None' = 'None';

  if (userId) {
    const likeInfo =
      await likesInfoQueryRepository.getLikesInfoByPostAndUserMongo(
        post._id.toString(),
        userId.toString(),
      );
    if (likeInfo) {
      myStatus = likeInfo.statusLike;
    }
  }

  // find last 3 Likes
  const newestLikes = await likesInfoQueryRepository.getNewestLikesOfPost(
    post._id.toString(),
  );
  const reformedNewestLikes = reformNewestLikes(newestLikes);

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
      myStatus: myStatus,
      newestLikes: reformedNewestLikes,
    },
  };
}

export function modifyPostForAllDocs( //todo in repo
  post: InputInfoPostType,
  // userId: ObjectId | null,
  // likesInfoQueryRepository: LikesInfoQueryRepository,
) /*Promise<PostViewType>*/ {
  const myStatus: 'Like' | 'Dislike' | 'None' = 'None';

  // if (userId) {
  //   const likeInfo = await likesInfoQueryRepository.getLikesInfoByPostAndUser(
  //     post._id.toString(),
  //     userId.toString(),
  //   );
  //   if (likeInfo) {
  //     myStatus = likeInfo.statusLike;
  //   }
  // }

  // find last 3 Likes
  // const newestLikes = await likesInfoQueryRepository.getNewestLikesOfPost(
  //   post._id.toString(),
  // );
  // const reformedNewestLikes = reformNewestLikes(newestLikes);

  return {
    id: post.id,
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: myStatus,
      newestLikes: [],
    },
  };
}

type InputInfoPostType = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};
