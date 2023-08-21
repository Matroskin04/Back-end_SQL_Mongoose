import { NewestLikesType } from '../../../../features/posts/infrastructure/repository/posts.types.repositories';

export function reformNewestLikes(newestLikes: NewestLikesType) {
  const reformedNewestLikes: any = [];

  for (const i of newestLikes) {
    reformedNewestLikes.push({
      userId: i.userId,
      login: i.login,
      addedAt: i.addedAt,
    });
  }

  return reformedNewestLikes;
}
