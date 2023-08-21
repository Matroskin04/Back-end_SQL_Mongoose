import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { CommentModelType } from '../../domain/comments.db.types';
import { InjectModel } from '@nestjs/mongoose';
import { CommentInstanceType } from './comments.types.repositories';
import { Comment, CommentatorInfo } from '../../domain/comments.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
  ) {}

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
