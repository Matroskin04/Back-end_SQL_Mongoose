import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostsLikesInfo } from '../../../../posts/domain/posts-likes-info.entity';
import {
  AllLikeStatusEnum,
  AllLikeStatusType,
} from '../../../../../infrastructure/utils/enums/like-status';

@Injectable()
export class LikesInfoOrmQueryRepository {
  constructor(
    @InjectRepository(PostsLikesInfo)
    protected postsLikesInfoRepository: Repository<PostsLikesInfo>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  //SQL
  async getLikesInfoPost(
    postId: string,
    userId: string,
  ): Promise<string | null> {
    const result = await this.postsLikesInfoRepository
      .createQueryBuilder('li')
      .select('li.likeStatus')
      .where('li.postId = :postId', { postId })
      .andWhere('li.userId = :userId', { userId })
      .getOne();

    return result ? AllLikeStatusEnum[result.likeStatus] : null;
  }

  async getLikesInfoComment(
    commentId: string,
    userId: string,
  ): Promise<string | null> {
    const result = await this.dataSource.query(
      `
      SELECT "likeStatus"
        FROM public."comments_likes_info"
      WHERE "commentId" = $1 AND "userId" = $2;`,
      [commentId, userId],
    );

    if (!result[0]) return null;
    return result[0];
  }
}
