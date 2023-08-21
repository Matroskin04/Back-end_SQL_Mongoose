export type QueryUserInputModel = {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: string | number;
  pageSize?: string | number;
  banStatus?: 'all' | 'banned' | 'notBanned';
};
//todo вынести
