import {
  BlogOutputModel,
  BlogOutputModelMongo,
} from '../../../api/blogger/models/output/blog.output.model';
import { ObjectId } from 'mongodb';

export type BlogPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BlogOutputModel>;
};

export type BlogOutputType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
};

export type BlogAllInfoOutputType = {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  websiteUrl: string;
  isMembership: boolean;
  isBanned: boolean;
};

export type BannedBlogsIdType = Array<{
  _id: ObjectId;
}>;
