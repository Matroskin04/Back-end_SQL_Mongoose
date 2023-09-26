import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionQuiz } from '../../../domain/question-quiz.entity';
import { Repository } from 'typeorm';
import {
  AnswersOfQuestionType,
  QuestionQuizAllInfoType,
} from './quiz.types.query.repository';

@Injectable()
export class QuizQueryRepository {
  constructor(
    @InjectRepository(QuestionQuiz)
    protected questionQuizRepository: Repository<QuestionQuiz>,
  ) {}

  //ADDITION
  async getQuestionAnswersById(id): Promise<null | AnswersOfQuestionType> {
    const result = await this.questionQuizRepository
      .createQueryBuilder('q')
      .select('q."correctAnswers"')
      .where('q."id" = :id', { id })
      .getRawOne();

    return result.correctAnswers ?? result;
  }

  async getQuestionAllInfoById(id): Promise<null | QuestionQuizAllInfoType> {
    const result = await this.questionQuizRepository
      .createQueryBuilder('q')
      .select()
      .where('q."id" = :id', { id })
      .getOne();

    return result
      ? {
          ...result,
          createdAt: result.createdAt.toString(),
          updatedAt: result.updatedAt?.toString() ?? null,
        }
      : null;
  }
}
