import { Injectable } from '@nestjs/common';
import {
  AllLikeStatusEnum,
  LikeDislikeStatusType,
  AllLikeStatusType,
} from '../../../../../infrastructure/utils/enums/like-status';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostsLikesInfo } from '../../../../posts/domain/posts-likes-info.entity';

@Injectable()
export class LikesInfoOrmRepository {
  constructor(
    @InjectRepository(PostsLikesInfo)
    protected postsLikesInfoRepository: Repository<PostsLikesInfo>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createLikeInfoOfPost(
    userId: string,
    postId: string,
    likeStatus: LikeDislikeStatusType,
  ): Promise<void> {
    const result = await this.postsLikesInfoRepository.save({
      userId,
      postId,
      likeStatus: AllLikeStatusEnum[likeStatus],
    });
    // .createQueryBuilder()
    // .insert()
    // .values({ userId, postId, likeStatus: AllLikeStatusEnum[likeStatus] })
    // .execute(); //todo difference save from insert query builder
    return;
  }

  async updatePostLikeInfo(
    userId: string,
    postId: string,
    likeStatus: AllLikeStatusType,
  ): Promise<boolean> {
    const result = await this.postsLikesInfoRepository
      .createQueryBuilder()
      .update()
      .set({ likeStatus: AllLikeStatusEnum[likeStatus] })
      .where('li.postId = :postId', { postId })
      .andWhere('li.userId = :userId', { userId })
      .execute();

    return result.affected === 1;
  }

  async createLikeInfoOfComment(
    userId: string,
    commentId: string,
    likeStatus: LikeDislikeStatusType,
  ): Promise<void> {
    const result = await this.dataSource.query(
      `
    INSERT INTO public."comments_likes_info"(
        "userId", "commentId", "likeStatus")
        VALUES ($1, $2, $3);`,
      [userId, commentId, AllLikeStatusEnum[likeStatus]],
    );
    return;
  }

  async updateCommentLikeInfo(
    userId: string,
    commentId: string,
    likeStatus: AllLikeStatusType,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE public."comments_likes_info"
        SET "likeStatus" = $1 
            WHERE "userId" = $2 AND "commentId" = $3;`,
      [AllLikeStatusEnum[likeStatus], userId, commentId],
    );
    return result[1] === 1;
  }

  async deleteLikeInfoComment(
    userId: string,
    commentId: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM public."comments_likes_info"
        WHERE "userId" = $1 AND "commentId" = $2`,
      [userId, commentId],
    );
    return result[1] === 1;
  }
}
