import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from '../../../../domain/quiz.entity';
import { Repository } from 'typeorm';
import { QuizStatusEnum } from '../../../../../../infrastructure/utils/enums/quiz.enums';
import { QuizRawInfoType } from './quiz.types.repository';

@Injectable()
export class QuizOrmRepository {
  constructor(
    @InjectRepository(Quiz)
    protected quizRepository: Repository<Quiz>,
  ) {}

  async createQuiz(
    userId: string,
    quizRepository: Repository<Quiz> = this.quizRepository,
  ): Promise<string> {
    const result = await quizRepository
      .createQueryBuilder()
      .insert()
      .values({ user1Id: userId })
      .returning('id')
      .execute();

    return result.raw[0].id;
  }

  //todo isolation - 2 requests don't prevent to each other
  async connectSecondPlayerToQuiz(
    userId: string,
  ): Promise<QuizRawInfoType | null> {
    const result = await this.quizRepository
      .createQueryBuilder()
      .update()
      .set({
        status: QuizStatusEnum['Active'],
        user2Id: userId,
        startGameDate: () => 'CURRENT_TIMESTAMP',
      })
      .where('status = :quizStatus', {
        quizStatus: QuizStatusEnum['PendingSecondPlayer'],
      })
      .returning([
        'id',
        'status',
        'pairCreatedDate',
        'startGameDate',
        'finishGameDate',
        'user1Id',
        'user2Id',
      ])
      .execute();

    if (result.affected === 0) return null;
    return result.raw[0];
  }

  async finishQuiz(
    quizId: string,
    quizRepository: Repository<Quiz> = this.quizRepository,
  ): Promise<boolean> {
    const result = await quizRepository
      .createQueryBuilder()
      .update()
      .set({
        status: QuizStatusEnum['Finished'],
        finishGameDate: () => 'CURRENT_TIMESTAMP',
      })
      .where('id = :quizId', {
        quizId,
      })
      .execute();

    return result.affected === 1;
  }

  async setFinishTimeFirstUser(
    quizId: string,
    userId: string,
    timestamp: number,
    quizRepository: Repository<Quiz> = this.quizRepository,
  ): Promise<boolean> {
    const result = await quizRepository
      .createQueryBuilder()
      .update()
      .set({
        status: QuizStatusEnum['Finished'],
        finishGameDate: () => 'CURRENT_TIMESTAMP',
      })
      .where('id = :quizId', {
        quizId,
      })
      .execute();

    return result.affected === 1;
  }
}
