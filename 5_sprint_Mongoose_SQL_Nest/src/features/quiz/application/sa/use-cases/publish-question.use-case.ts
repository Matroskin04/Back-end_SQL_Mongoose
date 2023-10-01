import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsOrmRepository } from '../../../infrastructure/typeORM/repository/questions-orm.repository';
import { QuestionsOrmQueryRepository } from '../../../infrastructure/typeORM/query.repository/questions-orm.query.repository';
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
    protected quizRepository: QuestionsOrmRepository,
    protected quizQueryRepository: QuestionsOrmQueryRepository,
  ) {}

  async execute(command: PublishQuestionCommand): Promise<boolean> {
    const { id, published } = command;

    const result1 = await this.quizQueryRepository.getQuestionAnswersById(id);
    if (!result1) return false;
    if (!result1.correctAnswers)
      throw new BadRequestException(
        createBodyErrorBadRequest(
          "The question doesn't have any correct answers",
          'correctAnswers',
        ),
      );

    const result2 = await this.quizRepository.publishQuestionQuiz(
      id,
      published,
    );
    return result2;
  }
}
