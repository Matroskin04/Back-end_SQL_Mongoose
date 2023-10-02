import {
  QuizAnswerStatusEnum,
  QuizStatusEnum,
} from '../../../../../infrastructure/utils/enums/quiz.enums';

export type QuizOutputModel = {
  id: string;
  firstPlayerProgress: InfoAboutUserQuizType;
  secondPlayerProgress: InfoAboutUserQuizType | null;
  questions: QuestionOfQuizType[] | null;
  status: QuizStatusEnum;
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
