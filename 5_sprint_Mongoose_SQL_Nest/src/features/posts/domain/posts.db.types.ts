import { ObjectId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { Post } from './posts.entity';

export type PostDBType = {
  _id: ObjectId;
  userId: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
  };
};

export type PostDocument = HydratedDocument<Post>;

export type PostModelType = Model<PostDocument> & PostModelStaticMethodsType;

export type PostModelStaticMethodsType = {
  createInstance: (
    postBody: PostDTOType,
    blogName: string,
    PostModel: PostModelType,
  ) => PostDocument;
};

export type PostDTOType = {
  title: string;
  userId: string;
  shortDescription: string;
  content: string;
  blogId: string;
};

export type PostUpdateDTOType = {
  title: string;
  shortDescription: string;
  content: string;
};
