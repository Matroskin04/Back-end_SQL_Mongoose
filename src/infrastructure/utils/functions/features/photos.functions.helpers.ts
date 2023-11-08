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
          url: wallpaper.url,
          width: wallpaper.width,
          height: wallpaper.height,
          fileSize: wallpaper.fileSize,
        }
      : null,
    main: icons.map((icon) => ({
      ...icon,
      url: icon.url,
    })),
  };
}
