/*
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BlogsQueryRepository } from '../../../features/blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { QuizQueryRepository } from '../../../features/quiz/infrastructure/typeORM/query.repository/quiz.query.repository';

@ValidatorConstraint({ name: 'DoesAnswersExist', async: true })
@Injectable()
export class DoesAnswersExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(protected quizQueryRepository: QuizQueryRepository) {}
  async validate(value: string, args: ValidationArguments | any) {
    const questionId = args;
    console.log(questionId);
    const question = await this.quizQueryRepository.getQuestionAllInfoById(
      questionId,
    );
    console.log(question);
    if (!question) throw new NotFoundException();
    return !!question.correctAnswers;
  }

  defaultMessage(args?: ValidationArguments): string {
    return `Question with such questionId doesn't exist`;
  }
}
*/

//todo НУЖЕН?
