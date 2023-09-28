import { PublishedStatusType } from '../../../../../infrastructure/types/quiz-questions.general.types';

export type QuestionQuizAllInfoType = {
  id: string;
  body: string | null;
  correctAnswers: string[] | null;
  published: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type QuestionPaginationType = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: QuestionQuizAllInfoType[];
};

export type AnswersOfQuestionType = { correctAnswers: string[] };

export type QuestionsQueryType = {
  bodySearchTerm: string;
  publishedStatus: PublishedStatusType;
  sortBy: string;
  sortDirection: 'ASC' | 'DESC';
  pageSize: number;
  pageNumber: number;
};
//todo вынести основные
