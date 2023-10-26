import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';
import { QuestionsOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/questions/questions-orm.query.repository';
import { QuizInfoAboutUserOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz-info-about-user-orm.repository';
import { DataSource } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';
import { AnswersQuizOrmRepository } from '../../../../infrastructure/typeORM/repository/answers-quiz-orm.repository';
import { QuizAnswerStatusEnum } from '../../../../../../infrastructure/utils/enums/quiz.enums';
import { QuizOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz/quiz-orm.repository';
import { startTransaction } from '../../../../../../infrastructure/utils/functions/db-helpers/transaction.helpers';
import { Quiz } from '../../../../domain/quiz.entity';
import { QuizInfoAboutUser } from '../../../../domain/quiz-game-info-about-user.entity';
import { AnswerQuiz } from '../../../../domain/answer-quiz.entity';
import { AnswersQuizOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/answers-quiz-orm.query.repository';
import { Cron, SchedulerRegistry } from '@nestjs/schedule';
import { QuestionQuiz } from '../../../../domain/question-quiz.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { QuizViewType } from '../../../../infrastructure/typeORM/query.repository/quiz/quiz.types.query.repository';

export class SendAnswerToQuizCommand {
  constructor(public currentUserId: string, public answer: string) {}
}

@CommandHandler(SendAnswerToQuizCommand)
export class SendAnswerToQuizUseCase
  implements ICommandHandler<SendAnswerToQuizCommand>
{
  timestamps: { stamp: number; userId: string }[] = [];
  cronInfo = {};
  constructor(
    protected quizOrmQueryRepository: QuizOrmQueryRepository,
    protected quizOrmRepository: QuizOrmRepository,
    protected quizInfoAboutUserOrmRepository: QuizInfoAboutUserOrmRepository,
    protected questionsOrmQueryRepository: QuestionsOrmQueryRepository,
    protected answersQuizOrmRepository: AnswersQuizOrmRepository,
    protected answersQuizOrmQueryRepository: AnswersQuizOrmQueryRepository,
    protected dataSource: DataSource,
  ) {}

  async execute(command: SendAnswerToQuizCommand): Promise<any> {
    const { currentUserId, answer } = command;

    //start transaction
    const { queryRunner, repositories } = await startTransaction(
      this.dataSource,
      [AnswerQuiz, QuizInfoAboutUser, Quiz, QuestionQuiz],
    );
    try {
      //check that user has an active game
      const activeQuiz =
        await this.quizOrmQueryRepository.getCurrentQuizByUserId(
          currentUserId,
          repositories.Quiz,
        );
      if (!activeQuiz || activeQuiz.status !== 'Active')
        throw new ForbiddenException('Active quiz game is not found');

      if (!activeQuiz.questions || !activeQuiz.secondPlayerProgress)
        throw new Error('Questions or the second player are not found');

      const [
        answersNumberCurrentUser,
        currentUserScore,
        answersNumberSecondUser,
        secondUserId,
        secondUserScore,
      ] = this.getCurrentUserInfo(activeQuiz, currentUserId);

      //if all answers already exists - then 403 status
      if (answersNumberCurrentUser === 5)
        throw new ForbiddenException('Player has already given all answers');

      //get correct answers of current question
      const currentQuestionId =
        activeQuiz.questions[answersNumberCurrentUser].id;
      const correctAnswers = await this.getCorrectAnswers(
        currentQuestionId,
        repositories.QuestionQuiz,
      );

      //validate user's answers
      const isAnswerCorrect = this.hasUserGivenCorrectAnswer(
        correctAnswers,
        answer,
      );
      //save answer info
      const createdAnswer = await this.answersQuizOrmRepository.createAnswer(
        +isAnswerCorrect,
        activeQuiz.id,
        currentUserId,
        currentQuestionId,
        repositories.AnswerQuiz,
      );

      //if answer is correct - increment score
      if (isAnswerCorrect) {
        await this.incrementPlayerScore(
          activeQuiz.id,
          currentUserId,
          repositories.QuizInfoAboutUser,
        );
      }

      //if it is the last answer of user:
      if (this.isPlayerGivingTheLastAnswer(answersNumberCurrentUser)) {
        //if another user also finished, then:
        if (answersNumberSecondUser === 5) {
          //finish quiz
          await this.finishQuiz(activeQuiz.id, repositories.Quiz);

          //increment second player's score (if player has more than 0 points)
          if (secondUserScore !== 0) {
            await this.incrementPlayerScore(
              activeQuiz.id,
              secondUserId,
              repositories.QuizInfoAboutUser,
            );
          }

          const index = this.timestamps.findIndex(
            (e) => (e.userId = currentUserId),
          );
          if (index > -1) {
            delete this.cronInfo[this.timestamps[index].stamp];
            this.timestamps.splice(index, 1);
          }
          //if the second user doesn't finish the quiz, then...
        } else {
          const stamp = Date.now();
          //todo in db, local store - not use
          this.timestamps.push({ stamp, userId: currentUserId });
          this.cronInfo[stamp] = {
            isAnswerCorrect,
            currentUserScore,
            secondUserId,
            currentUserId,
            secondUserScore,
            activeQuiz,
          };
        }
      }
      await queryRunner.commitTransaction();

      //return answerView
      return {
        questionId: currentQuestionId,
        answerStatus: QuizAnswerStatusEnum[+isAnswerCorrect],
        addedAt: createdAnswer.addedAt,
      };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.log('Something went wrong', e);
      //todo throw error
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  @Cron('* * * * * *', { name: 'cron' })
  private async checkEndTimeOfQuiz() {
    for (const info of this.timestamps) {
      const timestamp = info.stamp;
      if (Date.now() - timestamp > 8000) {
        // const job = this.schedulerRegistry.getCronJob('cron');
        // job.stop();
        const answersCount =
          await this.answersQuizOrmQueryRepository.getAnswersCountOfUser(
            this.cronInfo[timestamp].secondUserId,
            this.cronInfo[timestamp].activeQuiz.id,
          );
        if (answersCount === 5) return;

        const dataForTransaction = await startTransaction(this.dataSource, [
          AnswerQuiz,
          QuizInfoAboutUser,
          Quiz,
        ]);
        try {
          let questionNumber = answersCount;
          for (let i = 5; i > answersCount; i--) {
            //todo fix one query
            //if there are less than five answers, then create remaining answers
            await this.answersQuizOrmRepository.createAnswer(
              QuizAnswerStatusEnum.Incorrect,
              this.cronInfo[timestamp].activeQuiz.id,
              this.cronInfo[timestamp].secondUserId,
              this.cronInfo[timestamp].activeQuiz.questions[questionNumber++]
                .id,
              dataForTransaction.repositories.AnswerQuiz,
            );
          }

          if (
            answersCount < 5 &&
            this.cronInfo[timestamp].currentUserScore > 0
          ) {
            //increment user's score (if user has more than 0 points
            const result =
              await this.quizInfoAboutUserOrmRepository.incrementUserScore(
                this.cronInfo[timestamp].activeQuiz.id,
                this.cronInfo[timestamp].currentUserId,
                dataForTransaction.repositories.QuizInfoAboutUser,
              );
            if (!result)
              throw new Error('Something went wrong while incrementing score');
          }

          const result = this.quizOrmRepository.finishQuiz(
            this.cronInfo[timestamp].activeQuiz.id,
            dataForTransaction.repositories.Quiz,
          );
          if (!result)
            throw new Error(
              'Something went wrong while finishing the quiz game',
            );

          const index = this.timestamps.findIndex((e) => e.stamp === timestamp);
          this.timestamps.splice(index, 1);
          delete this.cronInfo[timestamp];
          await dataForTransaction.queryRunner.commitTransaction();
        } catch (e) {
          await dataForTransaction.queryRunner.rollbackTransaction();
          // job.start();
          console.log('Something went wrong in cron handler', e);
        } finally {
          await dataForTransaction.queryRunner.release();
        }
      }
    }
  }

  private getCurrentUserInfo(
    activeQuiz: QuizViewType,
    currentUserId: string,
  ): [number, number, number, string, number] {
    return activeQuiz.firstPlayerProgress.player.id === currentUserId
      ? [
          activeQuiz.firstPlayerProgress.answers?.length ?? 0,
          activeQuiz.firstPlayerProgress.score,
          activeQuiz.secondPlayerProgress!.answers?.length ?? 0,
          activeQuiz.secondPlayerProgress!.player.id,
          activeQuiz.secondPlayerProgress!.score,
        ]
      : [
          activeQuiz.secondPlayerProgress!.answers?.length ?? 0,
          activeQuiz.secondPlayerProgress!.score,
          activeQuiz.firstPlayerProgress.answers?.length ?? 0,
          activeQuiz.firstPlayerProgress.player.id,
          activeQuiz.firstPlayerProgress.score,
        ];
  }

  private async getCorrectAnswers(
    currentQuestionId: string,
    QuestionQuizRepo,
  ): Promise<string[]> {
    const correctAnswers =
      await this.questionsOrmQueryRepository.getAnswersOfQuestion(
        currentQuestionId,
        QuestionQuizRepo,
      );
    if (!correctAnswers) throw new Error('Correct answers are not found');

    return correctAnswers;
  }

  private hasUserGivenCorrectAnswer(correctAnswers: string[], answer: string) {
    return correctAnswers.join().split(',').includes(answer);
  }

  private isPlayerGivingTheLastAnswer(answersNumberCurrentUser): boolean {
    return answersNumberCurrentUser === 4;
  }

  private async finishQuiz(quizId: string, quizRepo): Promise<void> {
    //change status, set winner and finishDate
    const result = this.quizOrmRepository.finishQuiz(quizId, quizRepo);
    if (!result)
      throw new Error('Something went wrong while finishing the quiz game');
    return;
  }

  private async incrementPlayerScore(
    quizId,
    userId,
    quizInfoAboutUserRepo,
  ): Promise<void> {
    const result = await this.quizInfoAboutUserOrmRepository.incrementUserScore(
      quizId,
      userId,
      quizInfoAboutUserRepo,
    );
    if (!result)
      throw new Error('Something went wrong while incrementing score');
    return;
  }
}
