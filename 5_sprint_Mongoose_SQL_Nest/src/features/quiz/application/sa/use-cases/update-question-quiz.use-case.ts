import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/typeORM/repository/quiz.repository';

export class UpdateQuestionQuizCommand {
  constructor(public body: string, public correctAnswers: string[]) {}
}

@CommandHandler(UpdateQuestionQuizCommand)
export class UpdateQuestionQuizUseCase
  implements ICommandHandler<UpdateQuestionQuizCommand>
{
  constructor(protected quizRepository: QuizRepository) {}

  async execute(command: UpdateQuestionQuizCommand): Promise<boolean> {
    const { body, correctAnswers } = command;

    const result = await this.quizRepository.updateQuestionQuiz(
      body,
      correctAnswers,
    );

    return result;
  }
}
