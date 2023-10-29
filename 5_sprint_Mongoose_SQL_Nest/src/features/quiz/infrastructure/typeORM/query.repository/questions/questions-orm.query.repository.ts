import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionQuiz } from '../../../../domain/question-quiz.entity';
import { Brackets, Repository } from 'typeorm';
import {
  AnswersOfQuestionType,
  QuestionPaginationType,
  QuestionQuizAllInfoType,
  QuestionsQueryType,
} from './questions.types.query.repository';
import { variablesForReturn } from '../../../../../../infrastructure/utils/functions/variables-for-return.function';
import { modifyQuestionIntoViewModel } from '../../../../../../infrastructure/utils/functions/features/quiz.functions.helpers';

@Injectable()
export class QuestionsOrmQueryRepository {
  constructor(
    @InjectRepository(QuestionQuiz)
    protected questionQuizRepository: Repository<QuestionQuiz>,
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
          .from(QuestionQuiz, 'q')
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

  async get5RandomQuestions(
    questionQuizRepo: Repository<QuestionQuiz> = this.questionQuizRepository,
  ): Promise<{ id: string }[]> {
    const randomQuestions = await questionQuizRepo
      .createQueryBuilder('q')
      .select('q."id"')
      .orderBy('RANDOM()')
      .take(5)
      .getRawMany();

    return randomQuestions;
  }

  async getAnswersOfQuestion(
    questionId: string,
    questionQuizRepo: Repository<QuestionQuiz> = this.questionQuizRepository,
  ): Promise<null | string[]> {
    const query = await questionQuizRepo
      .createQueryBuilder()
      .setLock('pessimistic_read')
      .select('"correctAnswers"')
      .where('id = :questionId', { questionId });
    const result = await query.getRawOne();

    return result?.correctAnswers?.split(',') ?? null;
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
