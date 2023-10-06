import { Injectable } from '@nestjs/common';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';
import { Quiz } from '../../../../domain/quiz.entity';
import { QuizStatusEnum } from '../../../../../../infrastructure/utils/enums/quiz.enums';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionQuizRelation } from '../../../../domain/question-quiz-relation.entity';
import {
  QuizViewType,
  StatisticViewType,
  UsersIdsOfQuizType,
} from './quiz.types.query.repository';
import {
  modifyQuizIntoViewModel,
  modifyStatisticsIntoViewModel,
} from '../../../../../../infrastructure/utils/functions/features/quiz.functions.helpers';
import { AnswerQuiz } from '../../../../domain/answer-quiz.entity';
import { QuizInfoAboutUser } from '../../../../domain/quiz-game-info-about-user.entity';

@Injectable()
export class QuizOrmQueryRepository {
  constructor(
    @InjectRepository(Quiz)
    protected quizRepository: Repository<Quiz>,
  ) {}

  async getQuizByIdView(quizId: string): Promise<QuizViewType | null> {
    const result = await this.quizRepository
      .createQueryBuilder('q')
      .select([
        'q."id"',
        'q."user1Id"',
        'q."user2Id"',
        'q."status"',
        'q."pairCreatedDate"',
        'q."startGameDate"',
        'q."finishGameDate"',
        'u1."login" as "login1"',
        'u2."login" as "login2"',
        'gi1."score" as "score1"',
        'gi2."score" as "score2"',
      ])
      .addSelect((qb) => this.questionsBuilder(qb), 'questions')
      .addSelect((qb) => this.answersBuilder(qb, 'user1Id'), 'answers1')
      .addSelect((qb) => this.answersBuilder(qb, 'user2Id'), 'answers2')
      .leftJoin('q.user1', 'u1')
      .leftJoin('q.user2', 'u2')
      .leftJoin('q.quizGameInfoAboutUser', 'gi1', 'gi1."userId" = q."user1Id"')
      .leftJoin('q.quizGameInfoAboutUser', 'gi2', 'gi2."userId" = q."user2Id"')
      .where('q."id" = :quizId', { quizId })
      .getRawOne();

    if (!result) return null;
    return modifyQuizIntoViewModel(result);
  }

  async getCurrentQuizByUserId(userId: string): Promise<QuizViewType | null> {
    const query = await this.quizRepository
      .createQueryBuilder('q')
      .select([
        'q."id"',
        'q."user1Id"',
        'q."user2Id"',
        'q."status"',
        'q."pairCreatedDate"',
        'q."startGameDate"',
        'q."finishGameDate"',
        'u1."login" as "login1"',
        'u2."login" as "login2"',
        'gi1."score" as "score1"',
        'gi2."score" as "score2"',
      ])
      .addSelect((qb) => this.questionsBuilder(qb), 'questions')
      .addSelect((qb) => this.answersBuilder(qb, 'user1Id'), 'answers1')
      .addSelect((qb) => this.answersBuilder(qb, 'user2Id'), 'answers2')
      .leftJoin('q.user1', 'u1')
      .leftJoin('q.user2', 'u2')
      .leftJoin('q.quizGameInfoAboutUser', 'gi1', 'gi1."userId" = q."user1Id"')
      .leftJoin('q.quizGameInfoAboutUser', 'gi2', 'gi2."userId" = q."user2Id"')
      .where(
        new Brackets((qb) => {
          qb.where('q.status = :quizStatus1 OR q.status = :quizStatus2', {
            quizStatus1: QuizStatusEnum['Active'],
            quizStatus2: QuizStatusEnum['PendingSecondPlayer'],
          });
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('q.user1Id = :userId', { userId }).orWhere(
            'q.user2Id = :userId',
            { userId },
          );
        }),
      );
    const result = await query.getRawOne();

    if (!result) return null;
    return modifyQuizIntoViewModel(result);
  }

  async getMyStatistic(userId: string): Promise<StatisticViewType> {
    const query = await this.quizRepository
      .createQueryBuilder('q')
      .select('COUNT (*)', 'gamesCount')
      .addSelect('q."user1Id"')
      .addSelect(
        'COUNT(CASE WHEN qi1."score" > qi2."score" THEN 1 ELSE NULL END)',
        'user1IdWins',
      )
      .addSelect(
        'COUNT(CASE WHEN qi2."score" > qi1."score" THEN 1 ELSE NULL END)',
        'user2IdWins',
      )
      .addSelect((qb) => {
        return qb
          .select('SUM(qi."score")')
          .from(Quiz, 'q')
          .leftJoin(QuizInfoAboutUser, 'qi', 'qi.userId = :userId', {
            userId,
          })
          .where('q.status = :quizStatus', {
            quizStatus: QuizStatusEnum['Finished'],
          });
      }, 'sumScore')
      .leftJoin(QuizInfoAboutUser, 'qi1', 'qi1.userId = q.user1Id')
      .leftJoin(QuizInfoAboutUser, 'qi2', 'qi2.userId = q.user2Id')
      .where('q.status = :quizStatus', {
        quizStatus: QuizStatusEnum['Finished'],
      })
      .andWhere(
        new Brackets((qb) => {
          qb.where('q.user1Id = :userId', { userId }).orWhere(
            'q.user2Id = :userId',
            { userId },
          );
        }),
      );

    const result = await query.getRawOne();

    return modifyStatisticsIntoViewModel(result, userId);
  }

  //ADDITIONAL
  async getUsersOfQuizById(quizId: string): Promise<null | UsersIdsOfQuizType> {
    const query = await this.quizRepository
      .createQueryBuilder('q')
      .select(['q."user1Id"', 'q."user2Id"'])
      .where('q.id = :quizId', { quizId });

    const result = await query.getRawOne();
    return result ?? null;
  }
  async haveUserCurrentQuiz(userId: string): Promise<boolean> {
    const result = await this.quizRepository
      .createQueryBuilder('q')
      .select()
      .where(
        new Brackets((qb) => {
          qb.where('q.status = :quizStatus1 OR q.status = :quizStatus2', {
            quizStatus1: QuizStatusEnum['Active'],
            quizStatus2: QuizStatusEnum['PendingSecondPlayer'],
          });
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('q.user1Id = :userId', { userId }).orWhere(
            'q.user2Id = :userId',
            { userId },
          );
        }),
      )
      .getExists();

    return result;
  }

  //PRIVATE
  private questionsBuilder(qb: SelectQueryBuilder<any>) {
    return qb
      .select('json_agg(to_jsonb("fiveQuestions")) as "questions"')
      .from((qb) => {
        return qb
          .select(['qqr."questionId" as "id"', 'que."body"'])
          .from(QuestionQuizRelation, 'qqr')
          .leftJoin('qqr.question', 'que')
          .where('qqr."quizId" = q."id"')
          .limit(5);
      }, 'fiveQuestions');
  }

  private answersBuilder(
    qb: SelectQueryBuilder<any>,
    userId: 'user1Id' | 'user2Id',
  ) {
    return qb
      .select('json_agg(to_jsonb("answers")) as "allAnswers"')
      .from((qb) => {
        return qb
          .select(['a."questionId"', 'a."answerStatus"', 'a."addedAt"'])
          .from(AnswerQuiz, 'a')
          .where('a."quizId" = q."id"')
          .andWhere(`a."userId" = q."${userId}"`);
      }, 'answers');
  }
}
