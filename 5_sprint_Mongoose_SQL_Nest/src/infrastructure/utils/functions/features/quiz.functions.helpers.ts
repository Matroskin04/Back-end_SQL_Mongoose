import { QuestionQuizAllInfoType } from '../../../../features/quiz/infrastructure/typeORM/repository/questions/questions.types.repository';
import { QuizViewType } from '../../../../features/quiz/infrastructure/typeORM/query.repository/quiz/quiz.types.query.repository';
import { QuizAnswerStatusEnum, QuizStatusEnum } from '../../enums/quiz.enums';
import { QuizStatusType } from '../../../types/quiz-questions.general.types';

export function modifyQuestionIntoViewModel(question): QuestionQuizAllInfoType {
  return {
    id: question.id,
    body: question.body,
    correctAnswers: question.correctAnswers
      ? question.correctAnswers.split()
      : null,
    published: question.published,
    createdAt: question.createdAt.toISOString(),
    updatedAt: question.updatedAt ? question.updatedAt.toISOString() : null,
  };
}

export function modifyQuizIntoViewModel(
  quizInfo: QuizAllInfoRawType,
): QuizViewType {
  return {
    id: quizInfo.id,
    firstPlayerProgress: {
      answers:
        quizInfo.answers1?.map((answer) => ({
          ...answer,
          answerStatus: QuizAnswerStatusEnum[answer.answerStatus],
          addedAt: answer.addedAt,
        })) ?? [],
      player: {
        id: quizInfo.user1Id,
        login: quizInfo.login1,
      },
      score: quizInfo.score1 ?? 0,
    },
    secondPlayerProgress: quizInfo.user2Id
      ? {
          answers:
            quizInfo.answers2?.map((answer) => ({
              ...answer,
              answerStatus: QuizAnswerStatusEnum[answer.answerStatus],
              addedAt: answer.addedAt,
            })) ?? [],
          player: {
            id: quizInfo.user2Id,
            login: quizInfo.login2,
          },
          score: quizInfo.score2 ?? 0,
        }
      : null,
    questions: quizInfo.questions ?? null,
    status: QuizStatusEnum[quizInfo.status] as QuizStatusType,
    pairCreatedDate: quizInfo.pairCreatedDate.toISOString(),
    startGameDate: quizInfo.startGameDate
      ? quizInfo.startGameDate.toISOString()
      : null,
    finishGameDate: quizInfo.finishGameDate
      ? quizInfo.finishGameDate.toISOString()
      : null,
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
  questions: Array<any>;
  answers1: Array<any>;
  answers2: Array<any>;
  status: QuizStatusEnum;
  pairCreatedDate: Date;
  startGameDate: Date;
  finishGameDate: Date;
};
