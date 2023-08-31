import { ObjectId } from 'mongodb';

export type PostDBTypeMongo = {
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
