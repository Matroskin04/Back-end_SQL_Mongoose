import {
  QuizAnswerStatusEnum,
  QuizStatusEnum,
} from '../../../../../../infrastructure/utils/enums/quiz.enums';
import { QuizStatusType } from '../../../../../../infrastructure/types/quiz-questions.general.types';
import { SingleStatisticOutputModel } from '../../../../api/models/output/single-statistic.output.model';
import { AllQuizzesOutputModel } from '../../../../api/models/output/quiz.output.model';

export type UsersIdsOfQuizType = { user1Id: string; user2Id: string | null };

export type QuizPaginationType = AllQuizzesOutputModel;

export type QuizViewType = {
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

export type StatisticViewType = SingleStatisticOutputModel;
