import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import {
  CommentDBType,
  CommentModelType,
} from '../../domain/comments.db.types';
import { InjectModel } from '@nestjs/mongoose';
import { CommentInstanceType } from './comments.types.repositories';
import { Comment, CommentatorInfo } from '../../domain/comments.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

  //SQL

  async createComment(
    content: string,
    userId: string,
    postId: string,
  ): Promise<CommentDBType> {
    const result = await this.dataSource.query(
      `
    INSERT INTO public."comments"(
        "content", "userId", "postId")
        VALUES ($1, $2, $3)
    RETURNING "id", "content", "userId", "postId"`,
      [content, userId, postId],
    );
    return result[0];
  }

  async updateComment(content: string, commentId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE public."comments" 
      SET "content" = $1
        WHERE "id" = $2`,
      [content, commentId],
    );
    return result[1] === 1;
  }
  //MONGO

  async getCommentInstance(
    commentId: ObjectId,
  ): Promise<CommentInstanceType | null> {
    const comment = await this.CommentModel.findOne({ _id: commentId });
    return comment;
  }

  async save(comment: CommentInstanceType): Promise<void> {
    await comment.save();
    return;
  }

  async createComments(comments): Promise<void> {
    await this.CommentModel.insertMany(comments);
    return;
  } //todo типизация

  async deleteComment(id: ObjectId): Promise<boolean> {
    const result = await this.CommentModel.deleteOne({ _id: id });
    return result.deletedCount === 1;
  }

  async deleteCommentsByUserId(userId: string): Promise<boolean> {
    const result = await this.CommentModel.deleteMany({
      'commentatorInfo.userId': userId,
    });
    return result.deletedCount > 0;
  }
}
