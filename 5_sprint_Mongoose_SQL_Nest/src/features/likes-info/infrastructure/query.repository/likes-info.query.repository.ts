import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import {
  CommentsLikesInfoDBType,
  PostsLikesInfoDBType,
} from '../../domain/likes-info.db.types';
import { InjectModel } from '@nestjs/mongoose';
import { CommentLikesInfo } from '../../domain/likes-info.entity';
import { NewestLikesType } from '../../../posts/infrastructure/repository/posts.types.repositories';
import {
  CommentsLikesInfoOfUserType,
  PostsLikesInfoOfUserType,
} from './likes-info.types.query.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesInfoQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(CommentLikesInfo.name)
    private CommentsLikesInfoModel,
  ) {}

  //SQL
  async getLikesInfoPost(
    postId: string,
    userId: string,
  ): Promise<string | null> {
    const result = await this.dataSource.query(
      `
    SELECT "likeStatus"
        FROM public."posts-likes_info"
    WHERE "postId" = $1 AND "userId" = $2;`,
      [postId, userId],
    );

    if (!result[0]) return null;
    return result[0];
  }

  //MONGO
  async getLikesInfoByCommentAndUser(
    commentId: string,
    userId: string,
  ): Promise<CommentsLikesInfoDBType | null> {
    return this.CommentsLikesInfoModel.findOne({ commentId, userId });
  }

  async getLikesInfoByPostAndUserMongo(
    postId: string,
    userId: string,
  ): Promise<PostsLikesInfoDBType | null> {
    return null; /*this.PostsLikesInfoModel.findOne({ postId, userId });*/
  }

  async getNewestLikesOfPost(postId: string): Promise<NewestLikesType> {
    return []; /*this.PostsLikesInfoModel.find({ postId, statusLike: 'Like' })
      .sort({ addedAt: -1 })
      .limit(3)
      .lean();
  }*/
  }
}
