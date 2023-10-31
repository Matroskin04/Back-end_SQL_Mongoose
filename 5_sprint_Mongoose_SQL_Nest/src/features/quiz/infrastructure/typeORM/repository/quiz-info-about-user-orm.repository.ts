import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizInfoAboutUser } from '../../../domain/quiz-info-about-user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuizInfoAboutUserOrmRepository {
  constructor(
    @InjectRepository(QuizInfoAboutUser)
    protected quizInfoAboutUserRepository: Repository<QuizInfoAboutUser>,
  ) {}

  async createQuizInfoAboutUser(
    quizId: string,
    userId: string,
    quizInfoRepo: Repository<QuizInfoAboutUser> = this
      .quizInfoAboutUserRepository,
  ): Promise<void> {
    await quizInfoRepo
      .createQueryBuilder()
      .insert()
      .values({ quizId, userId })
      .execute();

    return;
  }

  async incrementUserScore(
    quizId: string,
    userId: string,
    quizInfoRepo: Repository<QuizInfoAboutUser> = this
      .quizInfoAboutUserRepository,
  ): Promise<boolean> {
    const result = await quizInfoRepo
      .createQueryBuilder()
      .update()
      .set({ score: () => 'score + 1' })
      .where('quizId = :quizId', { quizId })
      .andWhere('userId = :userId', { userId })
      .execute();

    return result.affected === 1;
  }
}
