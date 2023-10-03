import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';
import { QuestionsOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/questions/questions-orm.query.repository';
import { QuizInfoAboutUserOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz-info-about-user-orm.repository';
import { DataSource } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';
import { AnswersQuizOrmRepository } from '../../../../infrastructure/typeORM/repository/answers/answers-quiz-orm.repository';
import { QuizAnswerStatusEnum } from '../../../../../../infrastructure/utils/enums/quiz.enums';

export class SendAnswerToQuizCommand {
  constructor(public userId: string, public answer: string) {}
}

@CommandHandler(SendAnswerToQuizCommand)
export class ConnectToQuizUseCase
  implements ICommandHandler<SendAnswerToQuizCommand>
{
  constructor(
    protected quizOrmQueryRepository: QuizOrmQueryRepository,
    protected quizInfoAboutUserOrmRepository: QuizInfoAboutUserOrmRepository,
    protected questionsOrmQueryRepository: QuestionsOrmQueryRepository,
    protected answersQuizOrmRepository: AnswersQuizOrmRepository,
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

    if (
      !activeQuiz.questions ||
      !(activeQuiz.status === 'Active') ||
      !activeQuiz.secondPlayerProgress
    )
      throw new Error(
        "Questions are not found or status of quiz is not 'Active'",
      );

    const [answersNumberCurrentUser, answersNumberSecondUser] =
      activeQuiz.firstPlayerProgress.player.id === userId
        ? [
            activeQuiz.firstPlayerProgress.score,
            activeQuiz.secondPlayerProgress.score,
          ]
        : [
            activeQuiz.secondPlayerProgress.score,
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
    //validate user's answers
    const isAnswerCorrect = correctAnswers.indexOf(answer) > -1;
    //save answer info
    const createdAnswer = await this.answersQuizOrmRepository.createAnswer(
      +isAnswerCorrect,
      activeQuiz.id,
      userId,
      currentQuestionId,
    );
    //if answer is correct - increment score
    if (isAnswerCorrect) {
      const result =
        await this.quizInfoAboutUserOrmRepository.incrementUserScore(
          activeQuiz.id,
          userId,
        );
      if (!result)
        throw new Error('Something went wrong while incrementing score');
    }
    //if it is the last answer:
    if (answersNumberCurrentUser === 4) {
      if (answersNumberSecondUser < 5) {
        const result =
          await this.quizInfoAboutUserOrmRepository.incrementUserScore(
            activeQuiz.id,
            userId,
          );
        if (!result)
          throw new Error('Something went wrong while incrementing score');
      }
    }

    return {
      questionId: currentQuestionId,
      answerStatus: QuizAnswerStatusEnum[+isAnswerCorrect],
      addedAt: createdAnswer.addedAt,
    };
  }
}
