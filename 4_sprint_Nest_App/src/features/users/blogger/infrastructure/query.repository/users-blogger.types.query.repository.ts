import { BannedUsersViewType } from '../../../banned/banned-by-blogger-users/domain/users-banned-by-blogger.db.types';

export type BannedUsersOfBlogPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BannedUsersViewType>;
};
