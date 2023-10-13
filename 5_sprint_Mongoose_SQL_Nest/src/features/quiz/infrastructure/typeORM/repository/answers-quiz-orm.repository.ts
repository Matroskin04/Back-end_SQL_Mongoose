import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AnswerQuiz } from '../../../domain/answer-quiz.entity';
import { Repository } from 'typeorm';
import { QuizAnswerStatusEnum } from '../../../../../infrastructure/utils/enums/quiz.enums';

@Injectable()
export class AnswersQuizOrmRepository {
  constructor(
    @InjectRepository(AnswerQuiz)
    protected answersQuizRepository: Repository<AnswerQuiz>,
  ) {}

  async createAnswer(
    status: QuizAnswerStatusEnum,
    quizId: string,
    userId: string,
    questionId: string,
    answersQuizRepo: Repository<AnswerQuiz> = this.answersQuizRepository,
  ): Promise<{ addedAt: string }> {
    const result = await answersQuizRepo
      .createQueryBuilder()
      .insert()
      .values({
        answerStatus: status,
        quizId,
        userId,
        questionId,
      })
      .returning(['"addedAt"'])
      .execute();

    return result.raw[0];
  }
}
