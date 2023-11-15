import { Module } from '@nestjs/common';
import { QuizSaController } from './api/quiz-sa.controller';
import { QuizPublicController } from './api/quiz-public.controller';
import { QuizOrmQueryRepository } from './infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';
import { AnswersQuizOrmQueryRepository } from './infrastructure/typeORM/query.repository/answers-quiz-orm.query.repository';
import { QuizOrmRepository } from './infrastructure/typeORM/repository/quiz/quiz-orm.repository';
import { QuestionQuizRelationOrmRepository } from './infrastructure/typeORM/repository/question-quiz-relation-orm.repository';
import { QuizInfoAboutUserOrmRepository } from './infrastructure/typeORM/repository/quiz-info-about-user-orm.repository';
import { AnswersQuizOrmRepository } from './infrastructure/typeORM/repository/answers-quiz-orm.repository';
import { ConnectToQuizUseCase } from './application/sa/use-cases/public/connect-to-quiz.use-case';
import { SendAnswerToQuizUseCase } from './application/sa/use-cases/public/send-answer-to-quiz.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuestionQuiz } from './domain/question-quiz.entity';
import { AnswerQuiz } from './domain/answer-quiz.entity';
import { QuestionQuizRelation } from './domain/question-quiz-relation.entity';
import { Quiz } from './domain/quiz.entity';
import { QuizInfoAboutUser } from './domain/quiz-info-about-user.entity';
import { CqrsModule } from '@nestjs/cqrs';
import { QuestionsOrmQueryRepository } from './infrastructure/typeORM/query.repository/questions/questions-orm.query.repository';
import { QuestionsOrmRepository } from './infrastructure/typeORM/repository/questions/questions-orm.repository';
import { CreateQuestionUseCase } from './application/sa/use-cases/sa/create-question.use-case';
import { UpdateQuestionUseCase } from './application/sa/use-cases/sa/update-question.use-case';
import { PublishQuestionUseCase } from './application/sa/use-cases/sa/publish-question.use-case';
import { DeleteQuestionUseCase } from './application/sa/use-cases/sa/delete-question.use-case';

const entities = [
  QuestionQuiz,
  AnswerQuiz,
  QuestionQuizRelation,
  Quiz,
  QuizInfoAboutUser,
];

const queryRepositories = [
  QuizOrmQueryRepository,
  AnswersQuizOrmQueryRepository,
  QuestionsOrmQueryRepository,
];

const repositories = [
  QuestionsOrmRepository,
  QuizOrmRepository,
  QuestionQuizRelationOrmRepository,
  QuizInfoAboutUserOrmRepository,
  AnswersQuizOrmRepository,
];
const useCases = [
  ConnectToQuizUseCase,
  SendAnswerToQuizUseCase,
  CreateQuestionUseCase,
  UpdateQuestionUseCase,
  PublishQuestionUseCase,
  DeleteQuestionUseCase,
];
@Module({
  imports: [TypeOrmModule.forFeature([...entities]), CqrsModule],
  controllers: [QuizSaController, QuizPublicController],
  providers: [...queryRepositories, ...repositories, ...useCases],
})
export class QuizModule {}
