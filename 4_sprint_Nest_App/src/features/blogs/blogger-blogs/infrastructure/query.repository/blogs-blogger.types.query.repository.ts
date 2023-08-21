import { BlogOutputModel } from '../../api/models/output/blog.output.model';
import { ObjectId } from 'mongodb';

export type BlogPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BlogViewType>;
};
export type BlogViewType = BlogOutputModel;

export type BlogsIdType = Array<{ _id: ObjectId }>;
