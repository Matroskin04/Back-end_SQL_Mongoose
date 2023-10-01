import { Injectable } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { Quiz } from '../../../../domain/quiz.entity';
import { QuizStatusEnum } from '../../../../../../infrastructure/utils/enums/quiz.enums';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class QuizOrmQueryRepository {
  constructor(
    @InjectRepository(Quiz)
    protected quizRepository: Repository<Quiz>,
  ) {}

  async getAllInfoOfQuizById(quizId: string): Promise<void> {
    const result = await this.quizRepository
      .createQueryBuilder('q')
      .select([
        'q."id"',
        'q."user1Id"',
        'q."user2Id"',
        'q."status"',
        'q."pairCreatedDate"',
        'q."startGameDate"',
        'q."finishGameDate"',
        'u1."login" as "login1"',
        'u2."login" as "login2"',
        'gi1."score" as "score1"',
        'gi2."score" as "score2"',
      ])
      .leftJoin('q.user1', 'u1')
      .leftJoin('q.user2', 'u2')
      .leftJoin('q.quizGameInfoAboutUser', 'gi1', 'gi."userId" = q."user1Id"')
      .leftJoin('q.quizGameInfoAboutUser', 'gi2', 'gi."userId" = q."user2Id"');
  }

  //ADDITIONAL
  async haveUserCurrentQuiz(userId: string): Promise<boolean> {
    const result = await this.quizRepository
      .createQueryBuilder('q')
      .select()
      .where('q.status = :quizStatus', {
        quizStatus: QuizStatusEnum['PendingSecondPlayer'],
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('q.user1Id = :userId', { userId }).orWhere(
            'q.user2Id = :userId',
            { userId },
          );
        }),
      )
      .getExists();

    return result;
  }
}
