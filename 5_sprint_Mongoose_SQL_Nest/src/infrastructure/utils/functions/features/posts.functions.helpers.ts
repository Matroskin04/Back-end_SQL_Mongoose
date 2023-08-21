import { NewestLikesType } from '../../../../features/posts/infrastructure/repository/posts.types.repositories';
import { PostDBType } from '../../../../features/posts/domain/posts.db.types';
import { PostViewType } from '../../../../features/posts/infrastructure/query.repository/posts.types.query.repository';
import { ObjectId } from 'mongodb';
import { LikesInfoQueryRepository } from '../../../../features/likes-info/infrastructure/query.repository/likes-info.query.repository';
import { reformNewestLikes } from './likes-info.functions.helpers';

export function modifyPostIntoViewModel(
  post: PostDBType,
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

export async function modifyPostForAllDocs( //todo in repo
  post: PostDBType,
  userId: ObjectId | null,
  likesInfoQueryRepository: LikesInfoQueryRepository,
): Promise<PostViewType> {
  let myStatus: 'Like' | 'Dislike' | 'None' = 'None';

  if (userId) {
    const likeInfo = await likesInfoQueryRepository.getLikesInfoByPostAndUser(
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
