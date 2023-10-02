import { QuestionQuizAllInfoType } from '../../../../features/quiz/infrastructure/typeORM/repository/questions/questions.types.repository';
import { QuizViewType } from '../../../../features/quiz/infrastructure/typeORM/query.repository/quiz/quiz.types.query.repository';
import { QuizStatusEnum } from '../../enums/quiz.enums';
import { QuizStatusType } from '../../../types/quiz-questions.general.types';

export function modifyQuestionIntoViewModel(question): QuestionQuizAllInfoType {
  return {
    id: question.id,
    body: question.body,
    correctAnswers: question.correctAnswers
      ? question.correctAnswers.split(',')
      : null,
    published: question.published,
    createdAt: question.createdAt.toString(),
    updatedAt: question.updatedAt ? question.updatedAt.toString() : null,
  };
}

export function modifyQuizIntoViewModel(
  quizInfo: QuizAllInfoRawType,
): QuizViewType {
  return {
    id: quizInfo.id,
    firstPlayerProgress: {
      answers: quizInfo.answers1 ?? [],
      player: {
        id: quizInfo.user1Id,
        login: quizInfo.login1,
      },
      score: quizInfo.score1,
    },
    secondPlayerProgress: {
      answers: quizInfo.answers2 ?? [],
      player: {
        id: quizInfo.user2Id,
        login: quizInfo.login2,
      },
      score: quizInfo.score2,
    },
    questions: quizInfo.questions ?? [],
    status: QuizStatusEnum[quizInfo.status],
    pairCreatedDate: quizInfo.pairCreatedDate.toString(),
    startGameDate: quizInfo.startGameDate.toString(),
    finishGameDate: quizInfo.finishGameDate.toString(),
  };
}

export type QuizAllInfoRawType = {
  id: string;
  user1Id: string;
  login1: string;
  score1: number;
  user2Id: string;
  login2: string;
  score2: number;
  secondPlayerProgress: [];
  questions: [];
  answers1: [];
  answers2: [];
  status: QuizStatusType;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
};
