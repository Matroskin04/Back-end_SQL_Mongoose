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
  sortDirection: string;
  searchLoginTerm: string;
  searchEmailTerm: string;
  banStatus: '%%' | boolean;
};
