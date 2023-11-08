import {
  PhotoInfoViewType,
  PhotosOfBlogViewType,
} from '../../../../features/blogs/infrastructure/typeORM/query.repository/types/photos-for-post.types.query.repository';

export function modifyBlogPhotoIntoViewModel(
  wallpaper: PhotoInfoViewType | null,
  icons: PhotoInfoViewType[],
): PhotosOfBlogViewType {
  return {
    wallpaper: wallpaper
      ? {
          url:
            'https://content-platform.storage.yandexcloud.net/' + wallpaper.url,
          width: wallpaper.width,
          height: wallpaper.height,
          fileSize: wallpaper.fileSize,
        }
      : null,
    main: icons.map((icon) => ({
      ...icon,
      url: 'https://content-platform.storage.yandexcloud.net/' + icon.url,
    })),
  };
}
