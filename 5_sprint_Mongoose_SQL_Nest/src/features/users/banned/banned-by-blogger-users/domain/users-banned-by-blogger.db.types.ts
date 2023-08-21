import { HydratedDocument, Model } from 'mongoose';
import { BannedUsersByBlogger } from './users-banned-by-blogger.entity';

export type BannedUsersViewType = {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
};

export type BannedUserInfoType = {
  userId: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: string | null;
    banReason: string | null;
  };
};

export type BannedUsersByBloggerDocument =
  HydratedDocument<BannedUsersByBlogger>;

export type BannedUsersByBloggerModelType =
  Model<BannedUsersByBloggerDocument> & BannedUsersBloggerStaticMethodsType;

export type BannedUsersBloggerStaticMethodsType = {
  createInstance: (
    blogId: string,
    bannedUserInfo: BannedUserInfoType,
    BannedUserModel: BannedUsersByBloggerModelType,
  ) => BannedUsersByBloggerDocument;
};
