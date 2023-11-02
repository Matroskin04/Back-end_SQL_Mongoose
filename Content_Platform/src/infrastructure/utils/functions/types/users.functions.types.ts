export type BannedUserOfBlogType = {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: string | null;
    banReason: string | null;
  };
};

export type UserWithBanInfoRawType = {
  id: string;
  login: string;
  // email: string;
  // createdAt: string;
  isBanned: boolean;
  banDate: string | null;
  banReason: string | null;
};

export type UserInfoRawType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  isBanned: boolean;
  banDate: null | string;
  banReason: null | string;
};
