import { UserViewType } from '../../../../features/users/infrastructure/SQL/query.repository/users.output.types.query.repository';
import {
  BannedUserOfBlogType,
  UserInfoRawType,
  UserWithBanInfoRawType,
} from '../types/users.functions.types';

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
