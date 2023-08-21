import { ObjectId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { CommentLikesInfo, PostLikesInfo } from './likes-info.entity';

export class CommentsLikesInfoDBType {
  _id: ObjectId;

  commentId: string;

  userId: string;

  statusLike: 'Like' | 'Dislike';
}
export type CommentLikesInfoDocument = HydratedDocument<CommentLikesInfo>;

export type CommentLikesInfoModelType = Model<CommentLikesInfoDocument> &
  CommentLikesInfoStaticMethodsType;

export type CommentLikesInfoStaticMethodsType = {
  createInstance: (
    commentLikesInfoDTO: CommentLikesInfoDTOType,
    CommentsLikesInfoModel: CommentLikesInfoModelType,
  ) => CommentLikesInfoDocument;
};
export class CommentLikesInfoDTOType {
  commentId: string;
  userId: string;
  statusLike: 'Like' | 'Dislike';
}

export class PostsLikesInfoDBType {
  _id: ObjectId;

  postId: string;

  userId: string;

  login: string;

  addedAt: string;

  statusLike: 'Like' | 'Dislike' | 'None';
}
export type PostLikesInfoDocument = HydratedDocument<PostLikesInfo>;

export type PostLikesInfoModelType = Model<PostLikesInfoDocument> &
  PostsLikesInfoStaticMethodsType;

export type PostsLikesInfoStaticMethodsType = {
  createInstance: (
    postLikesInfoDTO: PostLikesInfoDTOType,
    PostLikesInfoModel: PostLikesInfoModelType,
  ) => PostLikesInfoDocument;
};

export class PostLikesInfoDTOType {
  postId: string;
  userId: string;
  login: string;
  addedAt: string;
  statusLike: 'Like' | 'Dislike' | 'None';
}
