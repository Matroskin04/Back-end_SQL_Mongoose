import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../../../infrastructure/typeORM/repository/quiz.repository';
import { QuizQueryRepository } from '../../../infrastructure/typeORM/query.repository/quiz.query.repository';

export class PublishQuestionCommand {
  constructor(public id: string, public published: boolean) {}
}

@CommandHandler(PublishQuestionCommand)
export class PublishQuestionUseCase
  implements ICommandHandler<PublishQuestionCommand>
{
  constructor(
    protected quizRepository: QuizRepository,
    protected quizQueryRepository: QuizQueryRepository,
  ) {}

  async execute(command: PublishQuestionCommand): Promise<boolean> {
    const { id, published } = command;

    const answers = this.quizQueryRepository.getQuestionAnswersById(id);
    if (!answers) return false;

    const result = await this.quizRepository.publishQuestionQuiz(id, published);
    return result;
  }
}
