import { Injectable } from '@nestjs/common';
import { Brackets, Repository } from 'typeorm';
import { Quiz } from '../../../domain/quiz.entity';
import { QuizStatusEnum } from '../../../../../infrastructure/utils/enums/quiz.enums';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class QuizOrmQueryRepository {
  constructor(
    @InjectRepository(Quiz)
    protected quizRepository: Repository<Quiz>,
  ) {}

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
