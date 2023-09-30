import {
  QuizAnswerStatusEnum,
  QuizStatusEnum,
} from '../../../../../infrastructure/utils/enums/quiz.enums';

export type QuizPublicOutputModel = {
  id: string;
  firstPlayerProgress: InfoAboutUserQuizType;
  secondPlayerProgress: InfoAboutUserQuizType;
  questions: Array<{
    id: 'string';
    body: 'string';
  }>;
  status: QuizStatusEnum;
  pairCreatedDate: string;
  startGameDate: string;
  finishGameDate: string;
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
