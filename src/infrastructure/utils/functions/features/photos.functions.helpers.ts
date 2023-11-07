import { BlogPhotoInfoType } from '../../../../features/blogs/infrastructure/typeORM/repository/photos-for-blog.types.repository';
import {
  BlogPhotoInfoViewType,
  PhotosOfBlogViewType,
} from '../../../../features/blogs/infrastructure/typeORM/query.repository/types/photos-for-blog.types.query.repository';

export function modifyBlogPhotoIntoViewModel(
  wallpaper: BlogPhotoInfoType | null,
  icons: BlogPhotoInfoViewType[],
): PhotosOfBlogViewType {
  return {
    wallpaper: wallpaper
      ? {
          ...wallpaper,
          url:
            'https://content-platform.storage.yandexcloud.net/' + wallpaper.url,
        }
      : {},
    main: icons.map((icon) => ({
      ...icon,
      url: 'https://content-platform.storage.yandexcloud.net/' + icon.url,
    })),
  };
}
