import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';
import { QuestionsOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/questions/questions-orm.query.repository';
import { QuestionQuizRelationOrmRepository } from '../../../../infrastructure/typeORM/repository/question-quiz-relation-orm.repository';
import { QuizOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz/quiz-orm.repository';
import { QuizInfoAboutUserOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz-info-about-user-orm.repository';
import { DataSource } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';
import { QuizInfoAboutUserQueryRepository } from '../../../../infrastructure/typeORM/query.repository/quiz-info-about-user/quiz-info-about-user.query.repository';
import { QuizInfoAboutUser } from '../../../../domain/quiz-game-info-about-user.entity';

export class SendAnswerToQuizCommand {
  constructor(public userId: string, public answer: string) {}
}

@CommandHandler(SendAnswerToQuizCommand)
export class ConnectToQuizUseCase
  implements ICommandHandler<SendAnswerToQuizCommand>
{
  constructor(
    protected quizOrmQueryRepository: QuizOrmQueryRepository,
    protected quizInfoAboutUserQueryRepository: QuizInfoAboutUserQueryRepository,
    protected questionsOrmQueryRepository: QuestionsOrmQueryRepository,
    protected dataSource: DataSource,
  ) {}

  async execute(command: SendAnswerToQuizCommand): Promise<any> {
    const { userId, answer } = command;

    const activeQuiz = await this.quizOrmQueryRepository.getCurrentQuizByUserId(
      userId,
    );
    //check that user has an active game
    if (!activeQuiz)
      throw new ForbiddenException('Active quiz game is not found');

    if (!activeQuiz.questions || !(activeQuiz.status === 'Active'))
      throw new Error(
        "Questions are not found or status of quiz is not 'Active'",
      );

    //check a number of user answers
    const answersNumber =
      await this.quizInfoAboutUserQueryRepository.getNumberOfAnswersById(
        activeQuiz.id,
        userId,
      );
    if (!answersNumber) throw new Error('Number of answers is not found');

    if (answersNumber === 5)
      throw new ForbiddenException(
        'All the answers have already been received',
      );

    const currentQuestionId = activeQuiz.questions[answersNumber].id;
    const correctAnswers =
      await this.questionsOrmQueryRepository.getAnswersOfQuestion(
        currentQuestionId,
      );
    //if it is the last answer:
    if (answersNumber === 4) {
    }
  }
}
