import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/typeORM/repository/quiz.repository';

export class PublishQuestionCommand {
  constructor(public id: string, public published: boolean) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase
  implements ICommandHandler<PublishQuestionCommand>
{
  constructor(protected quizRepository: QuizRepository) {}

  async execute(command: PublishQuestionCommand): Promise<boolean> {
    const { id, published } = command;

    const result = await this.quizRepository.publishQuestionQuiz(id, published);

    return result;
  }
}
