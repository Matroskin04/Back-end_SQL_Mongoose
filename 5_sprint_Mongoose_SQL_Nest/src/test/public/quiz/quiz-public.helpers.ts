import request from 'supertest';
import { QuizStatusType } from '../../../infrastructure/types/quiz-questions.general.types';
import { regexpISOSString } from '../../helpers/regexp/general-regexp';

export async function connectPlayerToQuiz(httpServer, accessToken) {
  return request(httpServer)
    .post(`/hometask-nest/pair-game-quiz/pairs/connection`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export async function getMyCurrentQuiz(httpServer, accessToken) {
  return request(httpServer)
    .get(`/hometask-nest/pair-game-quiz/pairs/my-current`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export async function getQuizById(httpServer, quizId, accessToken) {
  return request(httpServer)
    .get(`/hometask-nest/pair-game-quiz/pairs/${quizId}`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export function createResponseSingleQuizTest(
  quizStatus?: QuizStatusType,
  questions?: '5questions' | null,
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
        id: user2Id ?? null,
        login: login2 ?? null,
      },
      score: score2 ?? expect.any(Number),
    },
    questions: questions
      ? expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            body: expect.any(String),
          }),
        ])
      : [],
    status: quizStatus ?? expect.any(String),
    pairCreatedDate: expect.stringMatching(regexpISOSString),
    startGameDate:
      startDate === 'string' ? expect.stringMatching(regexpISOSString) : null,
    finishGameDate:
      finishDate === 'string' ? expect.stringMatching(regexpISOSString) : null,
  };
}
