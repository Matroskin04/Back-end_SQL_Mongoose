export type AllQueryParamsTypes = {
  searchNameTerm?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  sortBy?: string;
  sortDirection?: string;
  pageNumber?: string | number;
  pageSize?: string | number;
  banStatus?: 'all' | 'banned' | 'notBanned';
};
