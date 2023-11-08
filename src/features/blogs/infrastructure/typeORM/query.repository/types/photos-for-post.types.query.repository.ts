export type PhotosOfBlogViewType = {
  wallpaper: PhotoInfoViewType | { [K in any]: never };
  main: PhotoInfoViewType[];
};

export type PhotoInfoViewType = {
  url: string;
  width: number;
  height: number;
  fileSize: number;
};
