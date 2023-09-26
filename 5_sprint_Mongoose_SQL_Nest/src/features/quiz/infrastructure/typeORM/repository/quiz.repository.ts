import { Injectable } from '@nestjs/common';
import { QuestionQuizAllInfoType } from './quiz.types.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionQuiz } from '../../../domain/question-quiz.entity';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(QuestionQuiz)
    protected questionQuizRepository: Repository<QuestionQuiz>,
  ) {}

  async createQuestionQuiz(
    body: string,
    correctAnswers: string[],
  ): Promise<QuestionQuizAllInfoType> {
    const result = await this.questionQuizRepository
      .createQueryBuilder()
      .insert()
      .values({ body, correctAnswers })
      .returning([
        'id',
        'body',
        'correctAnswers',
        'published',
        'createdAt',
        'updatedAt',
      ])
      .execute();
    return {
      ...result.raw[0],
      correctAnswers: result.raw[0].correctAnswers.split(','),
      createdAt: result.raw[0].createdAt.toString(),
    };
  }

  async updateQuestionQuiz(
    questionId: string,
    body: string,
    correctAnswers: string[],
  ): Promise<boolean> {
    const result = await this.questionQuizRepository
      .createQueryBuilder()
      .update()
      .set({ body, correctAnswers, updatedAt: () => 'CURRENT_TIMESTAMP' })
      .where('id = :questionId', { questionId })
      .execute();

    return result.affected === 1;
  }

  async publishQuestionQuiz(
    questionId: string,
    published: boolean,
  ): Promise<boolean> {
    const result = await this.questionQuizRepository
      .createQueryBuilder()
      .update()
      .set({ published })
      .where('id = :questionId', { questionId })
      .execute();

    return result.affected === 1;
  }

  async deleteQuestionQuiz(questionId: string): Promise<boolean> {
    const result = await this.questionQuizRepository
      .createQueryBuilder()
      .delete()
      .where('id = :questionId', { questionId })
      .execute();

    return result.affected === 1;
  }
}
