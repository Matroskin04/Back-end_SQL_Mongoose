import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { LikesInfo, LikesInfoSchema } from '../../posts/domain/posts.entity';

import { CommentDocument, CommentModelType } from './comments.db.types';

@Schema()
export class CommentatorInfo {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  userLogin: string;
}
export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);
@Schema()
export class Comment {
  _id: ObjectId;

  @Prop({ required: true })
  content: string;

  @Prop({ type: CommentatorInfoSchema, required: true }) //todo create addition schema?
  commentatorInfo: CommentatorInfo;

  @Prop({ required: true, default: new Date().toISOString() })
  createdAt: string;

  @Prop({ required: true })
  postId: string;

  @Prop({ type: LikesInfoSchema })
  likesInfo: LikesInfo;

  static createInstance(
    content: string,
    userId: string,
    userLogin: string,
    postId: string,
    CommentModel: CommentModelType,
  ): CommentDocument {
    return new CommentModel({
      _id: new ObjectId(),
      content,
      commentatorInfo: {
        userId,
        userLogin,
      },
      postId,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    });
  }
}
export const CommentsSchema = SchemaFactory.createForClass(Comment);

CommentsSchema.statics = {
  createInstance: Comment.createInstance,
};
