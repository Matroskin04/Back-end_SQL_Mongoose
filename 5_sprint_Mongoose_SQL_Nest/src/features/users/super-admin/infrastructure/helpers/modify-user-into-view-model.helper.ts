import {
  BannedUserOfBlogType,
  UserViewType,
} from '../../../infrastructure/query.repository/users-sa.types.query.repository';
//todo type
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
