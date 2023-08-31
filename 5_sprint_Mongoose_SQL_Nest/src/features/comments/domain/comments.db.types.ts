import { ObjectId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';

export type CommentDBTypeMongo = {
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

export type CommentDBType = {
  id: string;
  content: string;
  createdAt: string;
  postId: string;
  userId: string;
};
