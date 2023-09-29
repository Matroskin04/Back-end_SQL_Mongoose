import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionsQuiz } from '../../../domain/questions-quiz.entity';
import { Brackets, Repository } from 'typeorm';
import {
  AnswersOfQuestionType,
  QuestionPaginationType,
  QuestionQuizAllInfoType,
  QuestionsQueryType,
} from './quiz.types.query.repository';
import { variablesForReturn } from '../../../../../infrastructure/utils/functions/variables-for-return.function';
import { Posts } from '../../../../posts/domain/posts.entity';
import { modifyPostIntoViewModel } from '../../../../../infrastructure/utils/functions/features/posts.functions.helpers';
import { modifyQuestionIntoViewModel } from '../../../../../infrastructure/utils/functions/features/quiz.functions.helpers';

@Injectable()
export class QuizQueryRepository {
  constructor(
    @InjectRepository(QuestionsQuiz)
    protected questionQuizRepository: Repository<QuestionsQuiz>,
  ) {}

  async getAllQuestions(
    query: QuestionsQueryType,
  ): Promise<QuestionPaginationType> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      publishedStatus,
      bodySearchTerm,
    } = variablesForReturn(query);

    const result = await this.questionQuizRepository
      .createQueryBuilder('q')
      .select([
        'q."id"',
        'q."body"',
        'q."correctAnswers"',
        'q."published"',
        'q."updatedAt"',
        'q."createdAt"',
      ])
      .where('1=1')
      .addSelect((subQuery) => {
        return subQuery
          .select('COUNT(*)')
          .from(QuestionsQuiz, 'q')
          .andWhere(this.publishedConditionBuilder(publishedStatus))
          .andWhere(this.bodyTermConditionBuilder(bodySearchTerm));
      }, 'count')
      .andWhere(this.publishedConditionBuilder(publishedStatus))
      .andWhere(this.bodyTermConditionBuilder(bodySearchTerm))
      .orderBy(`q.${sortBy}`, sortDirection)
      .limit(+pageSize)
      .offset((+pageNumber - 1) * +pageSize);

    const questionsInfo = await result.getRawMany();

    return {
      pagesCount: Math.ceil((+questionsInfo[0]?.count || 1) / +pageSize),
      page: +pageNumber,
      pageSize: +pageSize,
      totalCount: +questionsInfo[0]?.count || 0,
      items: questionsInfo.map((question) =>
        modifyQuestionIntoViewModel(question),
      ),
    };
  }

  //ADDITION
  async getQuestionAnswersById(
    id: string,
  ): Promise<null | AnswersOfQuestionType> {
    const result = await this.questionQuizRepository
      .createQueryBuilder('q')
      .select('q."correctAnswers"')
      .where('q."id" = :id', { id })
      .getRawOne();

    return result;
  }

  async getQuestionAllInfoById(
    id: string,
  ): Promise<null | QuestionQuizAllInfoType> {
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

  private publishedConditionBuilder(publishedStatus: boolean | null) {
    return new Brackets((qb) => {
      qb.where(
        'q."published" = :publishedStatus OR :publishedStatus::boolean IS NULL',
        {
          publishedStatus,
        },
      );
    });
  }

  private bodyTermConditionBuilder(bodySearchTerm: string) {
    return new Brackets((qb) => {
      qb.where('q."body" ILIKE :body', { body: `%${bodySearchTerm}%` });
    });
  }
}
