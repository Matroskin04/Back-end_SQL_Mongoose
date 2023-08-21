import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  PostDTOType,
  PostDocument,
  PostModelType,
  PostUpdateDTOType,
} from './posts.db.types';

@Schema()
export class LikesInfo {
  @Prop({ type: Number, required: true })
  likesCount: number;

  @Prop({ type: Number, required: true })
  dislikesCount: number;
}

export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);
@Schema()
export class Post {
  _id: ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  shortDescription: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  blogId: string;

  @Prop({ required: true })
  blogName: string;

  @Prop({ required: true })
  createdAt: string;

  @Prop({ type: LikesInfoSchema, required: true })
  likesInfo: LikesInfo;

  updatePostInfo(post: PostDocument, updateData: PostUpdateDTOType): void {
    post.title = updateData.title;
    // post.blogId = updateData.blogId;
    post.content = updateData.content;
    post.shortDescription = updateData.shortDescription;
    return;
  }

  static createInstance(
    postBody: PostDTOType,
    blogName: string,
    PostModel: PostModelType,
  ): PostDocument {
    return new PostModel({
      _id: new ObjectId(),
      userId: postBody.userId,
      title: postBody.title,
      shortDescription: postBody.shortDescription,
      content: postBody.content,
      blogId: postBody.blogId,
      blogName: blogName,
      createdAt: new Date().toISOString(),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
      },
    });
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
  updatePostInfo: Post.prototype.updatePostInfo,
};

PostSchema.statics = {
  createInstance: Post.createInstance,
};
