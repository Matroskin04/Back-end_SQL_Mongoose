import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizInfoAboutUser } from '../../../../domain/quiz-game-info-about-user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuizInfoAboutUserQueryRepository {
  constructor(
    @InjectRepository(QuizInfoAboutUser)
    protected quizInfoAboutUser: Repository<QuizInfoAboutUser>,
  ) {}

  async getNumberOfAnswersById(
    quizId: string,
    userId: string,
  ): Promise<null | number> {
    const query = await this.quizInfoAboutUser
      .createQueryBuilder('qi')
      .select('qi."numberOfAnswers"')
      .where('qi.userId = :userId', { userId })
      .andWhere('qi.quizId = :quizId', { quizId });
    const result = await query.getRawOne();

    return result?.numberOfAnswers ?? null;
  }
}
