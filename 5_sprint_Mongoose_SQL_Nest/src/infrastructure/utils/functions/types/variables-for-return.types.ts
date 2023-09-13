export type VariablesForReturnMongoType = {
  pageNumber: string | number;
  pageSize: string | number;
  sortBy: string;
  sortDirection: number;
  paramSort: any;
};

export type VariablesForReturnType = {
  pageNumber: string | number;
  pageSize: string | number;
  sortBy: string;
  sortDirection: 'ASC' | 'DESC';
  searchLoginTerm: string;
  searchEmailTerm: string;
  searchNameTerm: string;
  banStatus: null | boolean;
};
