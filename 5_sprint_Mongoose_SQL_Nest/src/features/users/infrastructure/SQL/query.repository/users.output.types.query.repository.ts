export type UsersInfoViewType = {
  email: string;
  login: string;
  userId: string;
};

export type UserViewType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  // banInfo: {
  //   isBanned: boolean;
  //   banDate: string | null;
  //   banReason: string | null;
  // };
};

export type BannedUsersOfBlogPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BannedUsersViewType>;
};
type BannedUsersViewType = {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
};

export type UsersPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<UserViewType>;
};

export type UserBanInfoType = {
  id: string;
  login: string;
  email: string;
  isBanned: boolean;
};

export type UserByRecoveryCodeType = {
  id: string;
  expirationDate: string;
  confirmationCode: string;
};

export type UserWithBanInfoType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  isBanned: boolean;
  banReason: string;
  banDate: string;
};

export type UserWithPassEmailInfoType = {
  id: string;
  login: string;
  email: string;
  passwordHash: string;
  isConfirmed: string;
};
export type UserIdAndConfirmationType = {
  isConfirmed: boolean;
  userId: string;
};
