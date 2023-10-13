import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { QuizOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz/quiz-orm.repository';
import { DataSource } from 'typeorm';
import { Quiz } from '../../../../domain/quiz.entity';
import { QuizInfoAboutUser } from '../../../../domain/quiz-game-info-about-user.entity';
import { QuestionsOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/questions/questions-orm.query.repository';
import { QuestionQuizRelationOrmRepository } from '../../../../infrastructure/typeORM/repository/question-quiz-relation-orm.repository';
import { QuizInfoAboutUserOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz-info-about-user-orm.repository';
import { startTransaction } from '../../../../../../infrastructure/utils/functions/db-helpers/transaction.helpers';
import { QuestionQuiz } from '../../../../domain/question-quiz.entity';
import { QuestionQuizRelation } from '../../../../domain/question-quiz-relation.entity';

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

    //add the second player and set starting game date (connect to quiz)
    const quizInfo = await this.quizOrmRepository.connectSecondPlayerToQuiz(
      userId,
    );

    //if user didn't connect - then create quiz and info about one player
    if (!quizInfo) {
      const dataForTransaction = await startTransaction(this.dataSource, [
        Quiz,
        QuizInfoAboutUser,
      ]);
      try {
        const quizId = await this.quizOrmRepository.createQuiz(
          userId,
          dataForTransaction.repositories.Quiz,
        );
        await this.quizInfoAboutUserOrmRepository.createQuizInfoAboutUser(
          quizId,
          userId,
          dataForTransaction.repositories.QuizInfoAboutUser,
        );

        await dataForTransaction.queryRunner.commitTransaction();

        //return quizView
        return this.quizOrmQueryRepository.getQuizByIdView(quizId);
      } catch (e) {
        await dataForTransaction.queryRunner.rollbackTransaction();
        console.log('something wrong', e);
      } finally {
        await dataForTransaction.queryRunner.release();
      }
    } else {
      //if user connected - find 5 random questions
      const questionsIds =
        await this.questionsOrmQueryRepository.get5RandomQuestions();
      if (questionsIds.length < 5)
        throw new BadRequestException(
          "There aren't enough questions in the database",
        );

      const dataForTransaction = await startTransaction(this.dataSource, [
        QuestionQuizRelation,
        QuizInfoAboutUser,
      ]);
      try {
        //then add 5 questions to quiz
        await this.questionQuizRelationOrmRepository.create5QuestionQuizRelations(
          quizInfo.id,
          questionsIds,
          dataForTransaction.repositories.QuestionQuizRelation,
        );

        //create info about the second player
        await this.quizInfoAboutUserOrmRepository.createQuizInfoAboutUser(
          quizInfo.id,
          userId,
          dataForTransaction.repositories.QuizInfoAboutUser,
        );

        await dataForTransaction.queryRunner.commitTransaction();

        //return quizView
        return this.quizOrmQueryRepository.getQuizByIdView(quizInfo.id);
      } catch (e) {
        await dataForTransaction.queryRunner.rollbackTransaction();
        console.log('something wrong', e);
      } finally {
        await dataForTransaction.queryRunner.release();
      }
    }
  }
}
