import { UserViewType } from '../query.repository/users-sa.types.query.repository';

export function modifyUserIntoViewModel(userInfo): UserViewType | [] {
  if (!userInfo) return [];
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
