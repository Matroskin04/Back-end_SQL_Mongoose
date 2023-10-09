import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnswerQuiz } from '../../../domain/answer-quiz.entity';

@Injectable()
export class AnswersQuizOrmQueryRepository {
  constructor(
    @InjectRepository(AnswerQuiz)
    protected answersQuizRepository: Repository<AnswerQuiz>,
  ) {}

  async getAnswersCountOfUser(userId: string, quizId: string): Promise<number> {
    const result = await this.answersQuizRepository
      .createQueryBuilder()
      .select()
      .where('userId = :userId', { userId })
      .andWhere('quizId = :quizId', { quizId })
      .getCount();
    return result;
  }
}
