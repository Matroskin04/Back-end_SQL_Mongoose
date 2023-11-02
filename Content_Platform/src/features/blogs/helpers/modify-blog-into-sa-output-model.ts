export function modifyBlogIntoSaOutputModel(
  blogInfo: BlogWithOwnerAndBanInfoType,
) {
  return {
    id: blogInfo.id,
    name: blogInfo.name,
    description: blogInfo.description,
    websiteUrl: blogInfo.websiteUrl,
    createdAt: blogInfo.createdAt,
    isMembership: blogInfo.isMembership,
    blogOwnerInfo: {
      userId: blogInfo.userId,
      userLogin: blogInfo.userLogin,
    },
    banInfo: {
      isBanned: blogInfo.isBanned,
      banDate: blogInfo.banDate,
    },
  };
}

type BlogWithOwnerAndBanInfoType = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  userId: string;
  userLogin: string;
  isBanned: boolean;
  banDate: string;
};
