import { BlogPhotoInfoType } from '../../../../features/blogs/infrastructure/typeORM/repository/photos-for-blog.types.repository';
import {
  BlogPhotoInfoViewType,
  PhotosOfBlogViewType,
} from '../../../../features/blogs/infrastructure/typeORM/query.repository/types/photos-for-blog.types.query.repository';

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
      wallpaper: blog.wallpaper,
      main: blog.icons,
    },
  };
}
