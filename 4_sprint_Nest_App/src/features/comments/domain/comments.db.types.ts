import { ObjectId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { Comment } from './comments.entity';

export type CommentDBType = {
  _id: ObjectId;
  content: string;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  createdAt: string;
  postId: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
  };
};

export type CommentDocument = HydratedDocument<Comment>;

export type CommentModelType = Model<CommentDocument> &
  CommentStaticMethodsType;

export type CommentStaticMethodsType = {
  createInstance: (
    content: string,
    userId: string,
    userLogin: string,
    postId: string,
    CommentModel: CommentModelType,
  ) => CommentDocument; //todo слишком много добавляется
};
