import { ObjectId } from 'mongodb';

export type ViewAllBlogsModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BlogSAOutputType>;
};

export type BlogSAOutputType = {
  id: ObjectId;
  banInfo: { isBanned: boolean; banDate: null | string };
} & BlogBodyType;

export type BlogSAOutputDBType = {
  _id: ObjectId;
  isBanned: boolean;
} & BlogBodyType;

export type BlogOutputType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  userId: string;
  isBanned: boolean;
};

type BlogBodyType = {
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
