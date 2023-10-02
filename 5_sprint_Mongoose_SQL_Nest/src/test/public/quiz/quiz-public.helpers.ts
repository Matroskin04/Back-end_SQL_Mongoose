import request from 'supertest';
import { QuizStatusType } from '../../../infrastructure/types/quiz-questions.general.types';

export async function connectPlayerToQuiz(httpServer, accessToken?) {
  return request(httpServer)
    .post(`/hometask-nest/pair-game-quiz/pairs/connection`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export function createResponseSingleQuizTest(
  quizStatus?: QuizStatusType,
  quizId?: string | null,
  user1Id?: string | null,
  score1?: number | null,
  user2Id?: string | null,
  login2?: string | null,
  score2?: number | null,
  startDate?: null | 'string',
  finishDate?: null | 'string',
) {
  return {
    id: quizId ?? expect.any(String),
    firstPlayerProgress: {
      answers: [],
      player: {
        id: user1Id ?? expect.any(String),
        login: expect.any(String),
      },
      score: score1 ?? expect.any(Number),
    },
    secondPlayerProgress: {
      answers: [],
      player: {
        id: user2Id ? expect.any(String) : null,
        login: login2 ? expect.any(String) : null,
      },
      score: score2 ?? expect.any(Number),
    },
    questions: [],
    status: quizStatus ?? expect.any(String),
    pairCreatedDate: expect.any(String),
    startGameDate: typeof startDate === 'string' ? expect.any(String) : null,
    finishGameDate: typeof finishDate === 'string' ? expect.any(String) : null,
  };
}
