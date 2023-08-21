import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  CommentLikesInfoDocument,
  CommentLikesInfoDTOType,
  CommentLikesInfoModelType,
  PostLikesInfoDocument,
  PostLikesInfoDTOType,
  PostLikesInfoModelType,
} from './likes-info.db.types';

@Schema()
export class CommentLikesInfo {
  _id: ObjectId;

  @Prop({ type: ObjectId, required: true })
  commentId: string;

  @Prop({ type: ObjectId, required: true })
  userId: string;

  @Prop({ required: true, enum: ['Like', 'Dislike'] })
  statusLike: 'Like' | 'Dislike';

  static createInstance(
    commentLikesInfoDTO: CommentLikesInfoDTOType,
    CommentsLikesInfoModel: CommentLikesInfoModelType,
  ): CommentLikesInfoDocument {
    return new CommentsLikesInfoModel(commentLikesInfoDTO);
  }
}

export const CommentsLikesInfoSchema =
  SchemaFactory.createForClass(CommentLikesInfo);

CommentsLikesInfoSchema.statics = {
  createInstance: CommentLikesInfo.createInstance,
};

@Schema()
export class PostLikesInfo {
  _id: ObjectId;

  @Prop({ type: ObjectId, required: true })
  postId: string;

  @Prop({ type: ObjectId, required: true })
  userId: string;

  @Prop({ required: true })
  login: string;

  @Prop({ required: true })
  addedAt: string;

  @Prop({ required: true, enum: ['Like', 'Dislike', 'None'] })
  statusLike: 'Like' | 'Dislike' | 'None';

  static createInstance(
    postLikesInfoDTO: PostLikesInfoDTOType,
    PostLikesInfoModel: PostLikesInfoModelType,
  ): PostLikesInfoDocument {
    return new PostLikesInfoModel(postLikesInfoDTO);
  }
}
export const PostsLikesInfoSchema = SchemaFactory.createForClass(PostLikesInfo);

PostsLikesInfoSchema.statics = {
  createInstance: PostLikesInfo.createInstance,
};
