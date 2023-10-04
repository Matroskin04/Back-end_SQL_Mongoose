import request from 'supertest';
import {
  QuizAnswerStatusType,
  QuizStatusType,
} from '../../../infrastructure/types/quiz-questions.general.types';
import { regexpISOSString } from '../../helpers/regexp/general-regexp';

export async function connectPlayerToQuizTest(httpServer, accessToken) {
  return request(httpServer)
    .post(`/hometask-nest/pair-game-quiz/pairs/connection`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export async function sendAnswerTest(httpServer, accessToken, answer) {
  return request(httpServer)
    .post(`/hometask-nest/pair-game-quiz/pairs/my-current/answers`)
    .set('Authorization', `Bearer ${accessToken}`)
    .send({ answer });
}

export async function getMyCurrentQuizTest(httpServer, accessToken) {
  return request(httpServer)
    .get(`/hometask-nest/pair-game-quiz/pairs/my-current`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export async function getQuizByIdTest(httpServer, quizId, accessToken) {
  return request(httpServer)
    .get(`/hometask-nest/pair-game-quiz/pairs/${quizId}`)
    .set('Authorization', `Bearer ${accessToken}`);
}

export function createResponseAnswerTest(
  questionId?,
  answerStatus?: 'Correct' | 'Incorrect',
) {
  return {
    questionId: questionId ?? expect.any(String),
    answerStatus:
      answerStatus ?? expect.stringMatching(/^(Correct|Incorrect)$/),
    addedAt: expect.any(String),
  };
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
  answerStatus1?: 'string' | null,
  answerStatus2?: 'string' | null,
  finishDate?: null | 'string',
) {
  return {
    id: quizId ?? expect.any(String),
    firstPlayerProgress: {
      answers: answerStatus1
        ? expect.arrayContaining([
            expect.objectContaining({
              questionId: expect.any(String),
              answerStatus: expect.toBeOneOf(['Correct', 'Incorrect']),
              addedAt: expect.stringMatching(regexpISOSString),
            }),
          ])
        : null,
      player: {
        id: user1Id ?? expect.any(String),
        login: expect.any(String),
      },
      score: score1 ?? expect.any(Number),
    },
    secondPlayerProgress: user2Id
      ? {
          answers: answerStatus2
            ? expect.arrayContaining([
                expect.objectContaining({
                  questionId: expect.any(String),
                  answerStatus: expect.toBeOneOf(['Correct', 'Incorrect']),
                  addedAt: expect.stringMatching(regexpISOSString),
                }),
              ])
            : null,
          player: {
            id: user2Id ?? expect.any(String),
            login: login2 ?? expect.any(String),
          },
          score: score2 ?? expect.any(Number),
        }
      : null,
    questions: questions
      ? expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            body: expect.any(String),
          }),
        ])
      : null,
    status: quizStatus ?? expect.any(String),
    pairCreatedDate: expect.stringMatching(regexpISOSString),
    startGameDate:
      startDate === 'string' ? expect.stringMatching(regexpISOSString) : null,
    finishGameDate:
      finishDate === 'string' ? expect.stringMatching(regexpISOSString) : null,
  };
}
