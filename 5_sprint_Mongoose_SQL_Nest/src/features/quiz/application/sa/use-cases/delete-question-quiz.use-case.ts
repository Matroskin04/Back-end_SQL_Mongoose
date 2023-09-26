import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/typeORM/repository/quiz.repository';

export class DeleteQuestionQuizCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteQuestionQuizCommand)
export class DeleteQuestionQuizUseCase
  implements ICommandHandler<DeleteQuestionQuizCommand>
{
  constructor(protected quizRepository: QuizRepository) {}

  async execute(command: DeleteQuestionQuizCommand): Promise<boolean> {
    const { id } = command;

    const result = await this.quizRepository.deleteQuestionQuiz(id);

    return result;
  }
}
