import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionsOrmRepository } from '../../../infrastructure/typeORM/repository/questions-orm.repository';

export class UpdateQuestionCommand {
  constructor(
    public id: string,
    public body: string | null,
    public correctAnswers: string[] | null,
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionUseCase
  implements ICommandHandler<UpdateQuestionCommand>
{
  constructor(protected quizRepository: QuestionsOrmRepository) {}

  async execute(command: UpdateQuestionCommand): Promise<boolean> {
    const { id, body, correctAnswers } = command;

    const result = await this.quizRepository.updateQuestionQuiz(
      id,
      body,
      correctAnswers,
    );

    return result;
  }
}
