export type UsersPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<UserViewType>;
};

export type UserViewType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: {
    isBanned: boolean;
    banDate: string | null;
    banReason: string | null;
  };
};

export type BannedUserOfBlogType = {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
};
