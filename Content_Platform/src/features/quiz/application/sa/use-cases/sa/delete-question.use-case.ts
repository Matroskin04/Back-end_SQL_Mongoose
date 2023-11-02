import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsOrmRepository } from '../../../../infrastructure/typeORM/repository/questions/questions-orm.repository';

export class DeleteQuestionCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionCommand)
export class DeleteQuestionUseCase
  implements ICommandHandler<DeleteQuestionCommand>
{
  constructor(protected quizRepository: QuestionsOrmRepository) {}

  async execute(command: DeleteQuestionCommand): Promise<boolean> {
    const { id } = command;

    const result = await this.quizRepository.deleteQuestionQuiz(id);

    return result;
  }
}
