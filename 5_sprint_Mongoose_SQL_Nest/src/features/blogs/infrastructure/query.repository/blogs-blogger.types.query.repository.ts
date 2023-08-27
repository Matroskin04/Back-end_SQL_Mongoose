import { ObjectId } from 'mongodb';
import { BlogOutputType } from '../repository/blogs-blogger.types.repositories';

export type BlogPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BlogViewType>;
};
export type BlogViewType = BlogOutputType;

export type BlogsIdType = Array<{ _id: ObjectId }>;
