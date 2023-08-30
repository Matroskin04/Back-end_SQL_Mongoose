import { Injectable } from '@nestjs/common';
import { LikesInfoRepository } from '../infrastructure/repository/likes-info.repository';
import { CommentLikesInfoModelType } from '../domain/likes-info.db.types';
import { InjectModel } from '@nestjs/mongoose';
import { CommentLikesInfo } from '../domain/likes-info.entity';

@Injectable()
export class LikesInfoService {
  constructor(
    @InjectModel(CommentLikesInfo.name)
    private CommentsLikesInfoModel: CommentLikesInfoModelType,
    protected likesInfoRepository: LikesInfoRepository,
  ) {}

  async createLikeInfoComment(
    userId: string,
    commentId: string,
    statusLike: 'Like' | 'Dislike',
  ): Promise<void> {
    const commentLikesInfo = this.CommentsLikesInfoModel.createInstance(
      {
        commentId,
        userId,
        statusLike,
      },
      this.CommentsLikesInfoModel,
    );

    await this.likesInfoRepository.save(commentLikesInfo);
    return;
  }
  async updateCommentLikeInfo(
    userId: string,
    commentId: string,
    statusLike: 'Like' | 'Dislike',
  ): Promise<boolean> {
    const commentLikeInfo =
      await this.likesInfoRepository.getCommentLikeInfoInstance(
        commentId,
        userId,
      );

    if (!commentLikeInfo) return false;

    commentLikeInfo.statusLike = statusLike;
    await this.likesInfoRepository.save(commentLikeInfo);
    return true;
  }
  async deleteLikeInfoComment(
    userId: string,
    commentId: string,
  ): Promise<boolean> {
    return this.likesInfoRepository.deleteLikeInfoCommentMongo(
      userId,
      commentId,
    );
  }
}
