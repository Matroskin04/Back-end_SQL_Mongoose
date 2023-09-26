import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/typeORM/repository/quiz.repository';
import { QuizQueryRepository } from '../../../infrastructure/typeORM/query.repository/quiz.query.repository';
import { BadRequestException } from '@nestjs/common';
import { createBodyErrorBadRequest } from '../../../../../infrastructure/utils/functions/create-error-bad-request.function';

export class PublishQuestionCommand {
  constructor(public id: string, public published: boolean) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase
  implements ICommandHandler<PublishQuestionCommand>
{
  constructor(
    protected quizRepository: QuizRepository,
    protected quizQueryRepository: QuizQueryRepository,
  ) {}

  async execute(command: PublishQuestionCommand): Promise<boolean> {
    const { id, published } = command;

    const answers = this.quizQueryRepository.getQuestionAnswersById(id);
    if (!answers)
      throw new BadRequestException(
        createBodyErrorBadRequest(
          "The question doesn't have any correct answers",
          'correctAnswers',
        ),
      );

    const result = await this.quizRepository.publishQuestionQuiz(id, published);
    return result;
  }
}
