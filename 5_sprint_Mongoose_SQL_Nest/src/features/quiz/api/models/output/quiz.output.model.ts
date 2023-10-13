import { QuizAnswerStatusEnum } from '../../../../../infrastructure/utils/enums/quiz.enums';
import { QuizStatusType } from '../../../../../infrastructure/types/quiz-questions.general.types';

//todo take out the general types
export type AllQuizzesOutputModel = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: Array<QuizOutputModel>;
};

export type QuizOutputModel = {
  id: string;
  firstPlayerProgress: InfoAboutUserQuizType;
  secondPlayerProgress: InfoAboutUserQuizType | null;
  questions: QuestionOfQuizType[] | null;
  status: QuizStatusType;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
};

type InfoAboutUserQuizType = {
  answers: Array<{
    questionId: string;
    answerStatus: QuizAnswerStatusEnum;
    addedAt: string;
  }>;
  player: {
    id: string;
    login: string;
  };
  score: number;
};

type QuestionOfQuizType = {
  id: string;
  body: string;
};
