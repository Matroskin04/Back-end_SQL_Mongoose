import { ObjectId } from 'mongodb';

export type BlogSAOutputModel = {
  id: string;

  name: string;

  description: string;

  websiteUrl: string;

  createdAt: string;

  isMembership: boolean;

  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
};
export type ViewAllBlogsModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BlogSAOutputModel>;
};
