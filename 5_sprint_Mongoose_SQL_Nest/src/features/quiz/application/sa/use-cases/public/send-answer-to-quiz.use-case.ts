import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';
import { QuestionsOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/questions/questions-orm.query.repository';
import { QuestionQuizRelationOrmRepository } from '../../../../infrastructure/typeORM/repository/question-quiz-relation-orm.repository';
import { QuizOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz/quiz-orm.repository';
import { QuizInfoAboutUserOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz-info-about-user-orm.repository';
import { DataSource } from 'typeorm';

export class SendAnswerToQuizCommand {
  constructor(public userId: string, public answer: string) {}
}

@CommandHandler(SendAnswerToQuizCommand)
export class ConnectToQuizUseCase
  implements ICommandHandler<SendAnswerToQuizCommand>
{
  constructor(
    protected quizOrmQueryRepository: QuizOrmQueryRepository,
    protected questionsOrmQueryRepository: QuestionsOrmQueryRepository,
    protected questionQuizRelationOrmRepository: QuestionQuizRelationOrmRepository,
    protected quizOrmRepository: QuizOrmRepository,
    protected quizInfoAboutUserOrmRepository: QuizInfoAboutUserOrmRepository,
    protected dataSource: DataSource,
  ) {}

  async execute(command: SendAnswerToQuizCommand): Promise<any> {
    const { userId, answer } = command;
  }
}
