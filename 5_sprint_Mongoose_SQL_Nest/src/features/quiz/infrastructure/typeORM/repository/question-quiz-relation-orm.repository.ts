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

  async create5QuestionQuizRelations(
    quizId: string,
    questionsIds: { id: string }[],
    questionQuizRepository: Repository<QuestionQuizRelation> = this
      .questionQuizRelationRepository,
  ): Promise<void> {
    //todo remove for
    for (const question of questionsIds) {
      await questionQuizRepository
        .createQueryBuilder()
        .insert()
        .values({ quizId, questionId: question.id })
        .execute();
    }

    return;
  }
}
