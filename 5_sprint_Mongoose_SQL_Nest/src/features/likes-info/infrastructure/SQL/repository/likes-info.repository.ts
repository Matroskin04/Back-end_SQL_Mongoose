import { Injectable } from '@nestjs/common';
import { AllLikeStatusEnum } from '../../../../../infrastructure/utils/enums/like-status';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  AllLikeStatusType,
  LikeDislikeStatusType,
} from '../../../../../infrastructure/types/like-status.general.types';

@Injectable()
export class LikesInfoRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async createLikeInfoOfPost(
    userId: string,
    postId: string,
    likeStatus: LikeDislikeStatusType,
  ): Promise<void> {
    const result = await this.dataSource.query(
      `
    INSERT INTO public."posts_likes_info"(
        "userId", "postId", "likeStatus")
        VALUES ($1, $2, $3);`,
      [userId, postId, AllLikeStatusEnum[likeStatus]],
    );
    return;
  }

  async updatePostLikeInfo(
    userId: string,
    postId: string,
    likeStatus: AllLikeStatusType,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE public."posts_likes_info"
        SET "likeStatus" = $1 
            WHERE "userId" = $2 AND "postId" = $3;`,
      [AllLikeStatusEnum[likeStatus], userId, postId],
    );
    return result[1] === 1;
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
