import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionQuizDTOType } from '../dto/question.dto';
import { QuizRepository } from '../../../infrastructure/typeORM/repository/quiz.repository';

export class CreateQuestionCommand {
  constructor(
    public body: string | null,
    public correctAnswers: string[] | null,
  ) {}
}

@CommandHandler(CreateQuestionCommand)
export class CreateQuestionUseCase
  implements ICommandHandler<CreateQuestionCommand>
{
  constructor(protected quizRepository: QuizRepository) {}

  async execute(command: CreateQuestionCommand): Promise<QuestionQuizDTOType> {
    const { body, correctAnswers } = command;

    const createdQuestion = await this.quizRepository.createQuestionQuiz(
      body,
      correctAnswers,
    );

    return createdQuestion;
  }
}
