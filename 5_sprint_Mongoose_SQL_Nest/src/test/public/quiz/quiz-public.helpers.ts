import request from 'supertest';

export async function connectPlayerToQuiz(httpServer, accessToken?) {
  return request(httpServer)
    .post(`/hometask-nest/pair-game-quiz/pairs/connection`)
    .set('Authorization', `Bearer ${accessToken}`);
}
