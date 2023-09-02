import { BlogOutputModel } from '../../api/models/output/blog.output.models';

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
  userId: string;
  isMembership: boolean;
  isBanned: boolean;
};
