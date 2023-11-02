import { ObjectId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';

export type CommentDBType = {
  id: string;
  content: string;
  createdAt: string;
  postId: string;
  userId: string;
};
