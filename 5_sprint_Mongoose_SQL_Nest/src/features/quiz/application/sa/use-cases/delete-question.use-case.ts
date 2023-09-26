import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/typeORM/repository/quiz.repository';

export class DeleteQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(protected quizRepository: QuizRepository) {}

  async execute(command: DeleteQuestionCommand): Promise<boolean> {
    const { id } = command;

    const result = await this.quizRepository.deleteQuestionQuiz(id);

    return result;
  }
}
