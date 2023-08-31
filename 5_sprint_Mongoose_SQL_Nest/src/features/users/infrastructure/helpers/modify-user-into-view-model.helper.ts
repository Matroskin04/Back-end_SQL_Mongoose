//todo type
import {
  BannedUserOfBlogType,
  UserViewType,
} from '../query.repository/users.types.query.repository';

export function modifyUserIntoViewModel(userInfo): UserViewType {
  return {
    id: userInfo.id,
    login: userInfo.login,
    email: userInfo.email,
    createdAt: userInfo.createdAt,
    banInfo: {
      isBanned: userInfo.isBanned,
      banDate: userInfo.banDate,
      banReason: userInfo.banReason,
    },
  };
}

//todo type
export function modifyBannedUserOfBlogIntoViewModel(
  userInfo,
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
