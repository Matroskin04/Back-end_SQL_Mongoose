import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizOrmQueryRepository } from '../../../infrastructure/typeORM/query.repository/quiz-orm.query.repository';

export class ConnectToQuizCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectToQuizCommand)
export class ConnectToQuizUseCase
  implements ICommandHandler<ConnectToQuizCommand>
{
  constructor(protected quizOrmQueryRepository: QuizOrmQueryRepository) {}

  async execute(command: ConnectToQuizCommand): Promise<any> {
    const { userId } = command;
  }
}
