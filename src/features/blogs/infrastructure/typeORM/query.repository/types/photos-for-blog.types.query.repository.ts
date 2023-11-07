export type PhotosOfBlogViewType = {
  wallpaper: BlogPhotoInfoViewType | { [K in any]: never };
  main: BlogPhotoInfoViewType[];
};

export type BlogPhotoInfoViewType = {
  url: string;
  width: number;
  height: number;
  fileSize: number;
};
