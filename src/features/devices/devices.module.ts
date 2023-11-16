import { Module } from '@nestjs/common';
import { QuestionQuiz } from '../quiz/domain/question-quiz.entity';
import { AnswerQuiz } from '../quiz/domain/answer-quiz.entity';
import { QuestionQuizRelation } from '../quiz/domain/question-quiz-relation.entity';
import { Quiz } from '../quiz/domain/quiz.entity';
import { QuizInfoAboutUser } from '../quiz/domain/quiz-info-about-user.entity';
import { QuizOrmQueryRepository } from '../quiz/infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';
import { AnswersQuizOrmQueryRepository } from '../quiz/infrastructure/typeORM/query.repository/answers-quiz-orm.query.repository';
import { QuestionsOrmQueryRepository } from '../quiz/infrastructure/typeORM/query.repository/questions/questions-orm.query.repository';
import { QuestionsOrmRepository } from '../quiz/infrastructure/typeORM/repository/questions/questions-orm.repository';
import { QuizOrmRepository } from '../quiz/infrastructure/typeORM/repository/quiz/quiz-orm.repository';
import { QuestionQuizRelationOrmRepository } from '../quiz/infrastructure/typeORM/repository/question-quiz-relation-orm.repository';
import { QuizInfoAboutUserOrmRepository } from '../quiz/infrastructure/typeORM/repository/quiz-info-about-user-orm.repository';
import { AnswersQuizOrmRepository } from '../quiz/infrastructure/typeORM/repository/answers-quiz-orm.repository';
import { ConnectToQuizUseCase } from '../quiz/application/sa/use-cases/public/connect-to-quiz.use-case';
import { SendAnswerToQuizUseCase } from '../quiz/application/sa/use-cases/public/send-answer-to-quiz.use-case';
import { CreateQuestionUseCase } from '../quiz/application/sa/use-cases/sa/create-question.use-case';
import { UpdateQuestionUseCase } from '../quiz/application/sa/use-cases/sa/update-question.use-case';
import { PublishQuestionUseCase } from '../quiz/application/sa/use-cases/sa/publish-question.use-case';
import { DeleteQuestionUseCase } from '../quiz/application/sa/use-cases/sa/delete-question.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { QuizSaController } from '../quiz/api/quiz-sa.controller';
import { QuizPublicController } from '../quiz/api/quiz-public.controller';
import { CreateDeviceUseCase } from './application/use-cases/create-device.use-case';
import { DeleteDeviceByRefreshTokenUseCase } from './application/use-cases/delete-device-by-refresh-token.use-case';
import { DeleteDevicesExcludeCurrentUseCase } from './application/use-cases/delete-devices-exclude-current.use-case';
import { DeleteDeviceByIdUseCase } from './application/use-cases/delete-device-by-id.use-case';
import { DeleteDevicesByUserIdUseCase } from './application/use-cases/delete-devices-by-user-id.use.case';
import { DevicesController } from './api/devices.controller';
import { DevicesQueryRepository } from './infrastructure/SQL/query.repository/devices.query.repository';
import { DevicesOrmQueryRepository } from './infrastructure/typeORM/query.repository/devices-orm.query.repository';
import { DevicesRepository } from './infrastructure/SQL/repository/devices.repository';
import { DevicesOrmRepository } from './infrastructure/typeORM/repository/devices-orm.repository';
import { JwtAdapter } from '../../infrastructure/adapters/jwt.adapter';
import { Devices } from './domain/devices.entity';
import { JwtModule } from '@nestjs/jwt';

const entities = [Devices];
const queryRepositories = [DevicesQueryRepository, DevicesOrmQueryRepository];
const repositories = [DevicesRepository, DevicesOrmRepository];
const useCases = [
  CreateDeviceUseCase,
  DeleteDeviceByRefreshTokenUseCase,
  DeleteDevicesExcludeCurrentUseCase,
  DeleteDeviceByIdUseCase,
  DeleteDevicesByUserIdUseCase,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([...entities]),
    CqrsModule,
    JwtModule.register({}),
  ],
  controllers: [DevicesController],
  providers: [...queryRepositories, ...repositories, ...useCases, JwtAdapter],
  exports: [TypeOrmModule],
})
export class DevicesModule {}
