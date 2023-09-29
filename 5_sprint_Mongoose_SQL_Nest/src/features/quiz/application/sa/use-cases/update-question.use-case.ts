import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/typeORM/repository/quiz.repository';

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
  constructor(protected quizRepository: QuizRepository) {}

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
