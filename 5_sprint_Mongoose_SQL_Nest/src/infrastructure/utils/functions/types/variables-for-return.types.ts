import { PublishedStatusType } from '../../../types/quiz-questions.general.types';

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
  bodySearchTerm: string;
  banStatus: null | boolean;
  publishedStatus: PublishedStatusType;
};
