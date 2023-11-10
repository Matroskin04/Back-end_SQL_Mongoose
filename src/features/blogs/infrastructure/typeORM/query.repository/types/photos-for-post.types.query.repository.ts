export type PhotosOfBlogViewType = {
  wallpaper: PhotoInfoViewType | null;
  main: PhotoInfoViewType[];
};

export type PhotoInfoViewType = {
  url: string;
  width: number;
  height: number;
  fileSize: number;
};
