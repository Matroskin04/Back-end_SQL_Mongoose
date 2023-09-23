import { Injectable } from '@nestjs/common';
import {
  AllLikeStatusEnum,
  LikeDislikeStatusType,
  AllLikeStatusType,
  LikeDislikeStatusEnum,
} from '../../../../../infrastructure/utils/enums/like-status';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostsLikesInfo } from '../../../../posts/domain/posts-likes-info.entity';
import { CommentsLikesInfo } from '../../../../comments/domain/comments-likes-info.entity';

@Injectable()
export class LikesInfoOrmRepository {
  constructor(
    @InjectRepository(CommentsLikesInfo)
    protected commentsLikesInfoRepository: Repository<CommentsLikesInfo>,
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
      .where('postId = :postId', { postId })
      .andWhere('userId = :userId', { userId })
      .execute();

    return result.affected === 1;
  }

  async createLikeInfoOfComment(
    userId: string,
    commentId: string,
    likeStatus: LikeDislikeStatusType,
  ): Promise<void> {
    const result = await this.commentsLikesInfoRepository.save({
      userId,
      commentId,
      likeStatus: LikeDislikeStatusEnum[likeStatus],
    });

    return;
  }

  async updateCommentLikeInfo(
    userId: string,
    commentId: string,
    likeStatus: AllLikeStatusType,
  ): Promise<boolean> {
    const result = await this.commentsLikesInfoRepository
      .createQueryBuilder()
      .update()
      .set({ likeStatus: LikeDislikeStatusEnum[likeStatus] })
      .where('userId = :userId', { userId })
      .andWhere('commentId = :commentId', { commentId })
      .execute();

    return result.affected === 1;
  }

  async deleteLikeInfoComment(
    userId: string,
    commentId: string,
  ): Promise<boolean> {
    const result = await this.commentsLikesInfoRepository.delete({
      userId,
      commentId,
    });

    return result.affected === 1;
  }
}
