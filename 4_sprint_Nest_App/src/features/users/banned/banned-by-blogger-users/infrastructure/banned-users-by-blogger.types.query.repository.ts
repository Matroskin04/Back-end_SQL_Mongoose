import { BannedUserInfoType } from '../domain/users-banned-by-blogger.db.types';

export type BannedUserByBloggerType = BannedUserInfoType & { blogId: string };
