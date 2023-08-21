import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentDBType } from '../../../../comments/domain/comments.db.types';
import {
  CommentsLikesInfoDBType,
  PostsLikesInfoDBType,
} from '../../../../likes-info/domain/likes-info.db.types';
import { PostDBType } from '../../../../posts/domain/posts.db.types';
import { PostSchema } from '../../../../posts/domain/posts.entity';
import {
  CommentsLikesInfoSchema,
  PostsLikesInfoSchema,
} from '../../../../likes-info/domain/likes-info.entity';
import {
  BannedUserDocument,
  BannedUserDTOType,
  BannedUserModelType,
} from './users-banned.db.types';
import { CommentsSchema } from '../../../../comments/domain/comments.entity';

@Schema()
export class BannedUserBySA {
  @Prop({ required: true })
  userId: string;

  @Prop({ type: [CommentsSchema] || null })
  comments: CommentDBType[] | null;

  @Prop({ type: [PostSchema] || null })
  posts: PostDBType[] | null;

  @Prop({ type: [CommentsLikesInfoSchema] || null })
  commentsLikesInfo: CommentsLikesInfoDBType[] | null;

  @Prop({ type: [PostsLikesInfoSchema] || null })
  postsLikesInfo: PostsLikesInfoDBType[] | null;

  static createInstance(
    bannedUserDTO: BannedUserDTOType,
    BannedUserModel: BannedUserModelType,
  ): BannedUserDocument {
    return new BannedUserModel(bannedUserDTO);
  }
}
export const BannedUserBySASchema =
  SchemaFactory.createForClass(BannedUserBySA); //todo change all names on SA

BannedUserBySASchema.statics = {
  createInstance: BannedUserBySA.createInstance,
};
