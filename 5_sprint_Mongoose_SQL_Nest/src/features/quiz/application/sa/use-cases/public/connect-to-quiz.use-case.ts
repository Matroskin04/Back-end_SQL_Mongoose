import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';
import { ForbiddenException } from '@nestjs/common';
import { QuizOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz/quiz-orm.repository';
import { DataSource } from 'typeorm';
import { Quiz } from '../../../../domain/quiz.entity';
import { QuizInfoAboutUser } from '../../../../domain/quiz-game-info-about-user.entity';
import { QuestionsOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/questions/questions-orm.query.repository';
import { QuestionQuizRelationOrmRepository } from '../../../../infrastructure/typeORM/repository/question-quiz-relation-orm.repository';
import { QuizInfoAboutUserOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz-info-about-user-orm.repository';

export class ConnectToQuizCommand {
  constructor(public userId: string) {}
}

@CommandHandler(ConnectToQuizCommand)
export class ConnectToQuizUseCase
  implements ICommandHandler<ConnectToQuizCommand>
{
  constructor(
    protected quizOrmQueryRepository: QuizOrmQueryRepository,
    protected questionsOrmQueryRepository: QuestionsOrmQueryRepository,
    protected questionQuizRelationOrmRepository: QuestionQuizRelationOrmRepository,
    protected quizOrmRepository: QuizOrmRepository,
    protected quizInfoAboutUserOrmRepository: QuizInfoAboutUserOrmRepository,
    protected dataSource: DataSource,
  ) {}

  async execute(command: ConnectToQuizCommand): Promise<any> {
    const { userId } = command;

    //check the existing current quiz at the user
    const haveCurrentQuiz =
      await this.quizOrmQueryRepository.haveUserCurrentQuiz(userId);
    if (haveCurrentQuiz)
      throw new ForbiddenException(
        'You have already started another quiz, finished it before starting a new',
      );

    //add second player and set starting game date (connect to quiz)
    const quizInfo = await this.quizOrmRepository.connectSecondPlayerToQuiz(
      userId,
    );

    //if user didn't connect - then create quiz and info about one player
    if (!quizInfo) {
      let quiz;
      await this.dataSource.manager.transaction(
        async (transactionalEntityManager) => {
          quiz = await transactionalEntityManager.save(new Quiz(userId));
          await transactionalEntityManager.save(
            new QuizInfoAboutUser(quiz.id, userId),
          );
        },
      );
      return this.quizOrmQueryRepository.getAllInfoOfQuizById(quiz.id);
    } else {
      //todo validation if questions don't exist
      //if user connected - find 5 random questions
      const questionsIds =
        await this.questionsOrmQueryRepository.get5RandomQuestions();

      //todo create method save and use it for Transaction (pass in this method transactional manager)
      //then add 5 questions to quiz
      await this.questionQuizRelationOrmRepository.create5QuestionQuizRelations(
        quizInfo.id,
        questionsIds,
      );

      //create info about the second player
      await this.quizInfoAboutUserOrmRepository.createQuizInfoAboutUser(
        quizInfo.id,
        userId,
      );

      return this.quizOrmQueryRepository.getAllInfoOfQuizById(quizInfo.id);
    }
  }
}
