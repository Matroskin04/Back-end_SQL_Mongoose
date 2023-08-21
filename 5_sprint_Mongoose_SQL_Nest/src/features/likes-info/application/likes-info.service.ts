import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { LikesInfoRepository } from '../infrastructure/repository/likes-info.repository';
import {
  CommentsLikesInfoDBType,
  CommentLikesInfoModelType,
  PostsLikesInfoDBType,
  PostLikesInfoModelType,
} from '../domain/likes-info.db.types';
import { InjectModel } from '@nestjs/mongoose';
import { CommentLikesInfo, PostLikesInfo } from '../domain/likes-info.entity';

@Injectable()
export class LikesInfoService {
  constructor(
    @InjectModel(CommentLikesInfo.name)
    private CommentsLikesInfoModel: CommentLikesInfoModelType,
    @InjectModel(PostLikesInfo.name)
    private PostsLikesInfoModel: PostLikesInfoModelType,
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

  async createLikeInfoPost(
    userId: string,
    postId: string,
    login: string,
    statusLike: 'Like' | 'Dislike',
  ): Promise<void> {
    const postLikesInfo = this.PostsLikesInfoModel.createInstance(
      { postId, userId, login, addedAt: new Date().toISOString(), statusLike },
      this.PostsLikesInfoModel,
    );

    await this.likesInfoRepository.save(postLikesInfo);
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

  async updatePostLikeInfo(
    userId: string,
    postId: string,
    statusLike: 'Like' | 'Dislike' | 'None',
  ): Promise<boolean> {
    const postLikeInfo = await this.likesInfoRepository.getPostLikeInfoInstance(
      postId,
      userId,
    );

    if (!postLikeInfo) return false;

    postLikeInfo.statusLike = statusLike;
    await this.likesInfoRepository.save(postLikeInfo);
    return true;
  }

  async deleteLikeInfoComment(
    userId: string,
    commentId: string,
  ): Promise<boolean> {
    return this.likesInfoRepository.deleteLikeInfoComment(userId, commentId);
  }

  async deleteLikeInfoPost(userId: string, postId: string): Promise<boolean> {
    return this.likesInfoRepository.deleteLikeInfoComment(userId, postId);
  }
}
