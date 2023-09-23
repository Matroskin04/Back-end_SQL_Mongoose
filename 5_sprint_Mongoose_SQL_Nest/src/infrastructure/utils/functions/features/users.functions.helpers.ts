import { UserViewType } from '../../../../features/users/infrastructure/SQL/query.repository/users.output.types.query.repository';

export function modifyUserIntoViewModel(
  userInfo: UserInfoRawType,
): UserViewType {
  return {
    id: userInfo.id,
    login: userInfo.login,
    email: userInfo.email,
    createdAt: userInfo.createdAt,
    // banInfo: {
    //   isBanned: userInfo.isBanned,
    //   banDate: userInfo.banDate,
    //   banReason: userInfo.banReason,
    // },
  };
}

export function modifyBannedUserOfBlogIntoViewModel(
  userInfo: UserWithBanInfoRawType,
): BannedUserOfBlogType {
  return {
    id: userInfo.id,
    login: userInfo.login,
    banInfo: {
      isBanned: userInfo.isBanned,
      banDate: userInfo.banDate,
      banReason: userInfo.banReason,
    },
  };
}

type BannedUserOfBlogType = {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: string | null;
    banReason: string | null;
  };
};

type UserWithBanInfoRawType = {
  id: string;
  login: string;
  // email: string;
  // createdAt: string;
  isBanned: boolean;
  banDate: string | null;
  banReason: string | null;
};

type UserInfoRawType = {
  id: string;
  login: string;
  email: string;
  createdAt: string;
};
