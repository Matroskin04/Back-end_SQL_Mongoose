import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';
import { QuestionsOrmQueryRepository } from '../../../../infrastructure/typeORM/query.repository/questions/questions-orm.query.repository';
import { QuizInfoAboutUserOrmRepository } from '../../../../infrastructure/typeORM/repository/quiz-info-about-user-orm.repository';
import { DataSource } from 'typeorm';
import { ForbiddenException } from '@nestjs/common';
import { AnswersQuizOrmRepository } from '../../../../infrastructure/typeORM/repository/answers/answers-quiz-orm.repository';
import { QuizAnswerStatusEnum } from '../../../../../../infrastructure/utils/enums/quiz.enums';

export class SendAnswerToQuizCommand {
  constructor(public currentUserId: string, public answer: string) {}
}

@CommandHandler(SendAnswerToQuizCommand)
export class SendAnswerToQuizUseCase
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
    const { currentUserId, answer } = command;

    const activeQuiz = await this.quizOrmQueryRepository.getCurrentQuizByUserId(
      currentUserId,
    );
    //check that user has an active game
    if (!activeQuiz || !(activeQuiz.status === 'Active'))
      throw new ForbiddenException('Active quiz game is not found');

    if (!activeQuiz.questions || !activeQuiz.secondPlayerProgress)
      throw new Error('Questions or the second player are not found');

    const [answersNumberCurrentUser, answersNumberSecondUser, secondUserId] =
      activeQuiz.firstPlayerProgress.player.id === currentUserId
        ? [
            activeQuiz.firstPlayerProgress.score,
            activeQuiz.secondPlayerProgress.score,
            activeQuiz.secondPlayerProgress.player.id,
          ]
        : [
            activeQuiz.secondPlayerProgress.score,
            activeQuiz.firstPlayerProgress.score,
            activeQuiz.firstPlayerProgress.player.id,
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
    const isAnswerCorrect =
      correctAnswers.join().split(',').indexOf(answer) > -1;
    //save answer info
    const createdAnswer = await this.answersQuizOrmRepository.createAnswer(
      +isAnswerCorrect,
      activeQuiz.id,
      currentUserId,
      currentQuestionId,
    );
    //if answer is correct - increment score
    if (isAnswerCorrect) {
      const result =
        await this.quizInfoAboutUserOrmRepository.incrementUserScore(
          activeQuiz.id,
          currentUserId,
        );
      if (!result)
        throw new Error('Something went wrong while incrementing score');
    }
    //if it is the last answer:
    if (answersNumberCurrentUser === 4) {
      if (answersNumberSecondUser === 5) {
        const result =
          await this.quizInfoAboutUserOrmRepository.incrementUserScore(
            activeQuiz.id,
            secondUserId,
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
