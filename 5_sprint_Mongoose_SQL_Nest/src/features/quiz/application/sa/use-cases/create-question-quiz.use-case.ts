import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { QuestionQuizDTOType } from '../dto/question.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizRepository } from '../../../infrastructure/typeORM/repository/quiz.repository';

export class CreateQuestionQuizCommand {
  constructor(public body: string, public correctAnswers: string[]) {}
}

@CommandHandler(CreateQuestionQuizCommand)
export class CreateQuestionQuizUseCase
  implements ICommandHandler<CreateQuestionQuizCommand>
{
  constructor(protected quizRepository: QuizRepository) {}

  async execute(
    command: CreateQuestionQuizCommand,
  ): Promise<QuestionQuizDTOType> {
    const { body, correctAnswers } = command;

    const createdQuestion = await this.quizRepository.createQuestionQuiz(
      body,
      correctAnswers,
    );

    return createdQuestion;
  }
}
