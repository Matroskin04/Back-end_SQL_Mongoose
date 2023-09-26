import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionQuiz } from '../../../domain/question-quiz.entity';
import { Repository } from 'typeorm';
import { QuestionQuizAllInfoType } from './quiz.types.query.repository';

@Injectable()
export class QuizQueryRepository {
  constructor(
    @InjectRepository(QuestionQuiz)
    protected questionQuizRepository: Repository<QuestionQuiz>,
  ) {}

  //ADDITION
  async getQuestionAllInfoById(id): Promise<null | QuestionQuizAllInfoType> {
    const result = await this.questionQuizRepository
      .createQueryBuilder('q')
      .select()
      .where('q."id" = :id', { id })
      .getOne();
    console.log(result);
    return result
      ? {
          ...result,
          createdAt: result.createdAt.toString(),
          updatedAt: result.updatedAt?.toString() ?? null,
        }
      : null;
  }
}
