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
  sort: {
    [key in fields]: 'ASC' | 'DESC';
  };
  sortDirection: 'ASC' | 'DESC';
  searchLoginTerm: string;
  searchEmailTerm: string;
  searchNameTerm: string;
  bodySearchTerm: string;
  banStatus: null | boolean;
  publishedStatus: boolean | null;
};

type fields =
  | 'sumScore'
  | 'avgScores'
  | 'gamesCount'
  | 'winsCount'
  | 'lossesCount'
  | 'drawsCount';
