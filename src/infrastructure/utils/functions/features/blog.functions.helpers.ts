export function modifyBlogIntoViewSAModel(blog) {
  return {
    id: blog.id,
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt.toISOString(),
    isMembership: blog.isMembership,
    blogOwnerInfo: {
      userId: blog.userId,
      userLogin: blog.userLogin,
    },
    banInfo: {
      isBanned: blog.isBanned,
      banDate: blog.banDate,
    },
  };
}

export function modifyBlogIntoViewGeneralModel(blog) {
  return {
    id: blog.id,
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt.toISOString(),
    isMembership: blog.isMembership,
    images: {
      wallpaper: blog.wallpaper ?? null,
      main: blog.icons ?? [],
    },
  };
}
