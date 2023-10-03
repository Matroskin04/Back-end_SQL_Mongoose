import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { QuestionsOrmQueryRepository } from '../infrastructure/typeORM/query.repository/questions/questions-orm.query.repository';
import { JwtAccessGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/current-user-id.param.decorator';
import { QuizOutputModel } from './models/output/quiz.output.model';
import { ConnectToQuizCommand } from '../application/sa/use-cases/public/connect-to-quiz.use-case';
import { SendAnswerInputModel } from './models/input/send-answer.input.model';
import { AnswerOutputModel } from './models/output/answer.output.model';
import { SendAnswerToQuizCommand } from '../application/sa/use-cases/public/send-answer-to-quiz.use-case';
import { QuizOrmQueryRepository } from '../infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';
import { DoesQuizBelongsToUserGuard } from '../../../infrastructure/guards/forbidden-guards/does-quiz-belongs-to-user.guard';

@Controller('/hometask-nest/pair-game-quiz/pairs')
export class QuizPublicController {
  constructor(
    protected commandBus: CommandBus,
    protected quizOrmQueryRepository: QuizOrmQueryRepository,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Get('my-current')
  async getMyCurrentGame(
    @CurrentUserId() userId: string,
  ): Promise<QuizOutputModel> {
    const result = await this.quizOrmQueryRepository.getCurrentQuizByUserId(
      userId,
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessGuard, DoesQuizBelongsToUserGuard)
  @Get(':quizId')
  async getQuizById(@Param('quizId') quizId: string): Promise<QuizOutputModel> {
    const result = await this.quizOrmQueryRepository.getQuizByIdView(quizId);

    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessGuard)
  @HttpCode(200)
  @Post('connection')
  async connectToQuiz(
    @CurrentUserId() userId: string,
  ): Promise<QuizOutputModel> {
    const result = await this.commandBus.execute(
      new ConnectToQuizCommand(userId),
    );
    return result;
  }

  @UseGuards(JwtAccessGuard)
  @HttpCode(200)
  @Post('my-current/answers')
  async sendAnswerToQuiz(
    @Body() inputAnswerModel: SendAnswerInputModel,
    @CurrentUserId() userId: string,
  ): Promise<AnswerOutputModel> {
    const result = await this.commandBus.execute(
      new SendAnswerToQuizCommand(userId, inputAnswerModel.answer),
    );
    return result;
  }
}
