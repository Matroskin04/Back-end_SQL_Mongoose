import { CommentDBType } from '../../../../comments/domain/comments.db.types';
import { PostDBTypeMongo } from '../../../../posts/domain/posts.db.types';
import {
  CommentsLikesInfoDBType,
  PostsLikesInfoDBType,
} from '../../../../likes-info/domain/likes-info.db.types';
import { HydratedDocument, Model } from 'mongoose';
import { BannedUserBySA } from './users-banned.entity';

export type BannedUserDTOType = {
  userId: string;
  comments: CommentDBType[] | null;
  posts: PostDBTypeMongo[] | null;
  commentsLikesInfo: CommentsLikesInfoDBType[] | null;
  postsLikesInfo: PostsLikesInfoDBType[] | null;
};

export type BannedUserDocument = HydratedDocument<BannedUserBySA>;

export type BannedUserModelType = Model<BannedUserDocument> &
  BannedUserModelStaticMethodsType;

export type BannedUserModelStaticMethodsType = {
  createInstance: (
    bannedUserDTO: BannedUserDTOType,
    BannedUserModel: BannedUserModelType,
  ) => BannedUserDocument;
};
