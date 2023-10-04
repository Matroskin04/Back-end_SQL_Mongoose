import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizInfoAboutUser } from '../../../domain/quiz-game-info-about-user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class QuizInfoAboutUserOrmRepository {
  constructor(
    @InjectRepository(QuizInfoAboutUser)
    protected quizInfoAboutUserRepository: Repository<QuizInfoAboutUser>,
  ) {}

  async createQuizInfoAboutUser(quizId: string, userId: string): Promise<void> {
    await this.quizInfoAboutUserRepository
      .createQueryBuilder()
      .insert()
      .values({ quizId, userId })
      .execute();

    return;
  }

  async incrementUserScore(quizId: string, userId: string): Promise<boolean> {
    const result = await this.quizInfoAboutUserRepository
      .createQueryBuilder()
      .update()
      .set({ score: () => 'score + 1' })
      .where('quizId = :quizId', { quizId })
      .andWhere('userId = :userId', { userId })
      .execute();

    return result.affected === 1;
  }
}
