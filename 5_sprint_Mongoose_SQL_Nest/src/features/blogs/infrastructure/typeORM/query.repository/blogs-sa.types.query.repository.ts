export type AllBlogsSAViewType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<BlogSAViewType>;
};

export type BlogSAViewType = {
  id: string;

  name: string;

  description: string;

  websiteUrl: string;

  createdAt: string;

  isMembership: boolean;

  // blogOwnerInfo: {
  //   userId: string;
  //   userLogin: string;
  // };
  // banInfo: {
  //   isBanned: boolean;
  //   banDate: string;
  // };
};
