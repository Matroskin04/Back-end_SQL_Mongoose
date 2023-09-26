import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/typeORM/repository/quiz.repository';

export class UpdateQuestionCommand {
  constructor(
    public id: string,
    public body: string,
    public correctAnswers: string[],
  ) {}
}

@CommandHandler(UpdateQuestionCommand)
export class UpdateQuestionQuizUseCase
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
