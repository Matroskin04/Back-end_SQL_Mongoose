import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import {
  CommentsLikesInfoDBType,
  PostsLikesInfoDBType,
} from '../../domain/likes-info.db.types';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLikesInfo,
  PostLikesInfo,
} from '../../domain/likes-info.entity';
import { NewestLikesType } from '../../../posts/infrastructure/repository/posts.types.repositories';
import {
  CommentsLikesInfoOfUserType,
  PostsLikesInfoOfUserType,
} from './likes-info.types.query.repository';

@Injectable()
export class LikesInfoQueryRepository {
  constructor(
    @InjectModel(CommentLikesInfo.name)
    private CommentsLikesInfoModel,
    @InjectModel(PostLikesInfo.name)
    private PostsLikesInfoModel,
  ) {}
  async getLikesInfoByCommentAndUser(
    commentId: string,
    userId: string,
  ): Promise<CommentsLikesInfoDBType | null> {
    return this.CommentsLikesInfoModel.findOne({ commentId, userId });
  }

  async getLikesInfoByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<PostsLikesInfoDBType | null> {
    return this.PostsLikesInfoModel.findOne({ postId, userId });
  }

  async getNewestLikesOfPost(postId: string): Promise<NewestLikesType> {
    return this.PostsLikesInfoModel.find({ postId, statusLike: 'Like' })
      .sort({ addedAt: -1 })
      .limit(3)
      .lean();
  }

  async getPostsLikesInfoByUserId(
    userId: string,
  ): Promise<PostsLikesInfoOfUserType> {
    const postsLikesInfo = await this.PostsLikesInfoModel.find({
      userId,
    }).lean();
    return postsLikesInfo.length ? postsLikesInfo : null; //if length === 0 -> return null
  }

  async getCommentsLikesInfoByUserId(
    userId: string,
  ): Promise<CommentsLikesInfoOfUserType> {
    const commentLikesInfo = await this.CommentsLikesInfoModel.find({
      userId,
    }).lean();
    return commentLikesInfo.length ? commentLikesInfo : null; //if length === 0 -> return null
  }
}
