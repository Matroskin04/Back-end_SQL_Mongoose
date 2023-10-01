import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../infrastructure/guards/authorization-guards/basic-auth.guard';
import { CreateQuestionInputModel } from './models/input/create-question.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/sa/use-cases/sa/create-question.use-case';
import { QuestionSaOutputModel } from './models/output/question-sa.output.model';
import { UpdateQuestionInputModel } from './models/input/update-question.input.model';
import { UpdateQuestionCommand } from '../application/sa/use-cases/sa/update-question.use-case';
import { DeleteQuestionCommand } from '../application/sa/use-cases/sa/delete-question.use-case';
import { PublishQuestionUseCase } from './models/input/publish-question.input.model';
import { PublishQuestionCommand } from '../application/sa/use-cases/sa/publish-question.use-case';
import { QueryQuestionsInputModel } from './models/input/query-questions.input.model';
import { QuestionsOrmQueryRepository } from '../infrastructure/typeORM/query.repository/questions/questions-orm.query.repository';
import { JwtAccessGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { QuizPublicOutputModel } from './models/output/quiz-public.output.model';
import { ConnectToQuizCommand } from '../application/sa/use-cases/public/connect-to-quiz.use-case';

@Controller('/hometask-nest/pair-game-quiz/pairs')
export class QuizPublicController {
  constructor(
    protected commandBus: CommandBus,
    protected quizQueryRepository: QuestionsOrmQueryRepository,
  ) {}
  @UseGuards(JwtAccessGuard)
  @Post('connection')
  async connectToQuiz(
    @CurrentUserId() userId: string,
  ): Promise<QuizPublicOutputModel | void> {
    const result = this.commandBus.execute(new ConnectToQuizCommand(userId));
    return;
  }
}
