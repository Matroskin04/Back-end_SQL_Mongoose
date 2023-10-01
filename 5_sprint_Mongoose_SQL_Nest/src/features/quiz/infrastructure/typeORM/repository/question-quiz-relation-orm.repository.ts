import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from '../../../domain/quiz.entity';
import { Repository } from 'typeorm';
import { QuestionQuizRelation } from '../../../domain/question-quiz-relation.entity';

@Injectable()
export class QuestionQuizRelationOrmRepository {
  constructor(
    @InjectRepository(QuestionQuizRelation)
    protected questionQuizRelationRepository: Repository<QuestionQuizRelation>,
  ) {}

  async createQuestionQuizRelation(
    quizId: string,
    questionId: string,
  ): Promise<void> {
    await this.questionQuizRelationRepository
      .createQueryBuilder()
      .insert()
      .values({ quizId, questionId })
      .execute();

    return;
  }
}
