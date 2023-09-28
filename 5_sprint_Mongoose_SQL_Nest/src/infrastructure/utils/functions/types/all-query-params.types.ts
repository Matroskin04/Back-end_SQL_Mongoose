import { PublishedStatusType } from '../../../types/quiz-questions.general.types';

export type AllQueryParamsTypes = {
  searchNameTerm?: string;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
  bodySearchTerm?: string;
  publishedStatus?: PublishedStatusType;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  pageNumber?: string | number;
  pageSize?: string | number;
  banStatus?: 'all' | 'banned' | 'notBanned';
};
