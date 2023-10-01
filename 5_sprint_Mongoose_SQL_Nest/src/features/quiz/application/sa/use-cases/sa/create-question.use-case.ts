import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuestionQuizDTOType } from '../../dto/question.dto';
import { QuestionsOrmRepository } from '../../../../infrastructure/typeORM/repository/questions/questions-orm.repository';

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
  constructor(protected quizRepository: QuestionsOrmRepository) {}

  async execute(command: CreateQuestionCommand): Promise<QuestionQuizDTOType> {
    const { body, correctAnswers } = command;

    const createdQuestion = await this.quizRepository.createQuestionQuiz(
      body,
      correctAnswers,
    );

    return createdQuestion;
  }
}
