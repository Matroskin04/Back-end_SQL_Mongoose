import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';
import { QuestionsOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/questions/questions-orm.query.repository';
import { QuizInfoAboutUserOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz-info-about-user-orm.repository';
import { DataSource, Repository } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';
import { AnswersQuizOrmRepository } from '../../../../infrastructure/typeORM/repository/answers-quiz-orm.repository';
import { QuizAnswerStatusEnum } from '../../../../../../infrastructure/utils/enums/quiz.enums';
import { QuizOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz/quiz-orm.repository';
import { startTransaction } from '../../../../../../infrastructure/utils/functions/db-helpers/transaction.helpers';
import { Quiz } from '../../../../domain/quiz.entity';
import { QuizInfoAboutUser } from '../../../../domain/quiz-game-info-about-user.entity';
import { AnswerQuiz } from '../../../../domain/answer-quiz.entity';
import { AnswersQuizOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/answers-quiz-orm.query.repository';
import { InjectRepository } from '@nestjs/typeorm';

export class SendAnswerToQuizCommand {
  constructor(public currentUserId: string, public answer: string) {}
}

@CommandHandler(SendAnswerToQuizCommand)
export class SendAnswerToQuizUseCase
  implements ICommandHandler<SendAnswerToQuizCommand>
{
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

    const activeQuiz = await this.quizOrmQueryRepository.getCurrentQuizByUserId(
      currentUserId,
    );
    //check that user has an active game
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
    ] =
      activeQuiz.firstPlayerProgress.player.id === currentUserId
        ? [
            activeQuiz.firstPlayerProgress.answers?.length ?? 0,
            activeQuiz.firstPlayerProgress.score,
            activeQuiz.secondPlayerProgress.answers?.length ?? 0,
            activeQuiz.secondPlayerProgress.player.id,
            activeQuiz.secondPlayerProgress.score,
          ]
        : [
            activeQuiz.secondPlayerProgress.answers?.length ?? 0,
            activeQuiz.secondPlayerProgress.score,
            activeQuiz.firstPlayerProgress.answers?.length ?? 0,
            activeQuiz.firstPlayerProgress.player.id,
            activeQuiz.firstPlayerProgress.score,
          ];

    //if all answers already exists - then 403 status
    if (answersNumberCurrentUser === 5)
      throw new ForbiddenException(
        'All the answers have already been received',
      );

    //get correct answers
    const currentQuestionId = activeQuiz.questions[answersNumberCurrentUser].id;
    const correctAnswers =
      await this.questionsOrmQueryRepository.getAnswersOfQuestion(
        currentQuestionId,
      );
    if (!correctAnswers) throw new Error('Correct answers is not found');

    //start transaction
    const dataForTransaction = await startTransaction(this.dataSource, [
      AnswerQuiz,
      QuizInfoAboutUser,
      Quiz,
    ]);
    try {
      //validate user's answers
      const isAnswerCorrect =
        correctAnswers.join().split(',').indexOf(answer) > -1;
      //save answer info
      const createdAnswer = await this.answersQuizOrmRepository.createAnswer(
        +isAnswerCorrect,
        activeQuiz.id,
        currentUserId,
        currentQuestionId,
        dataForTransaction.repositories.AnswerQuiz,
      );

      //if answer is correct - increment score
      if (isAnswerCorrect) {
        const result =
          await this.quizInfoAboutUserOrmRepository.incrementUserScore(
            activeQuiz.id,
            currentUserId,
            dataForTransaction.repositories.QuizInfoAboutUser,
          );
        if (!result)
          throw new Error('Something went wrong while incrementing score');
      }

      //if it is the last answer of user:
      if (answersNumberCurrentUser === 4) {
        //if another user also finished, then:
        if (answersNumberSecondUser === 5) {
          //change status, set winner and finishDate
          const result = this.quizOrmRepository.finishQuiz(
            activeQuiz.id,
            dataForTransaction.repositories.Quiz,
          );
          if (!result)
            throw new Error(
              'Something went wrong while finishing the quiz game',
            );

          if (secondUserScore !== 0) {
            //increment user's score (if user has more than 0 points
            const result =
              await this.quizInfoAboutUserOrmRepository.incrementUserScore(
                activeQuiz.id,
                secondUserId,
                dataForTransaction.repositories.QuizInfoAboutUser,
              );
            if (!result)
              throw new Error('Something went wrong while incrementing score');
          }
          //if the second user doesn't finish the quiz, then...
        } else {
          //set 10 seconds while the second user can send answers
          setTimeout(async () => {
            const dataForTransaction = await startTransaction(this.dataSource, [
              AnswerQuiz,
              QuizInfoAboutUser,
              Quiz,
            ]);
            try {
              //get all answers of the second user in current quiz
              const answersCount =
                await this.answersQuizOrmQueryRepository.getAnswersCountOfUser(
                  secondUserId,
                  activeQuiz.id,
                );
              let questionNumber = answersCount;

              for (let i = 5; i > answersCount; i--) {
                //if there are less than five answers, then create remaining answers
                await this.answersQuizOrmRepository.createAnswer(
                  +isAnswerCorrect,
                  activeQuiz.id,
                  secondUserId,
                  activeQuiz.questions![questionNumber++].id,
                  dataForTransaction.repositories.AnswerQuiz,
                );
              }

              if (answersCount < 5 && currentUserScore > 0) {
                //increment user's score (if user has more than 0 points
                const result =
                  await this.quizInfoAboutUserOrmRepository.incrementUserScore(
                    activeQuiz.id,
                    currentUserId,
                    dataForTransaction.repositories.QuizInfoAboutUser,
                  );
                if (!result)
                  throw new Error(
                    'Something went wrong while incrementing score',
                  );
              }
              const result = this.quizOrmRepository.finishQuiz(
                activeQuiz.id,
                dataForTransaction.repositories.Quiz,
              );
              if (!result)
                throw new Error(
                  'Something went wrong while finishing the quiz game',
                );

              await dataForTransaction.queryRunner.commitTransaction();
            } catch (e) {
              await dataForTransaction.queryRunner.rollbackTransaction();
              console.log('Something went wrong', e);
            } finally {
              await dataForTransaction.queryRunner.release();
            }
          }, 5000);
        }
      }
      await dataForTransaction.queryRunner.commitTransaction();

      //return answerView
      return {
        questionId: currentQuestionId,
        answerStatus: QuizAnswerStatusEnum[+isAnswerCorrect],
        addedAt: createdAnswer.addedAt,
      };
    } catch (e) {
      await dataForTransaction.queryRunner.rollbackTransaction();
      console.log('Something went wrong', e);
    } finally {
      await dataForTransaction.queryRunner.release();
    }
  }
}
