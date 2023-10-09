import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAccessGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/current-user-id.param.decorator';
import {
  AllQuizzesOutputModel,
  QuizOutputModel,
} from './models/output/quiz.output.model';
import { ConnectToQuizCommand } from '../application/sa/use-cases/public/connect-to-quiz.use-case';
import { SendAnswerInputModel } from './models/input/send-answer.input.model';
import { AnswerOutputModel } from './models/output/answer.output.model';
import { SendAnswerToQuizCommand } from '../application/sa/use-cases/public/send-answer-to-quiz.use-case';
import { QuizOrmQueryRepository } from '../infrastructure/typeORM/query.repository/quiz/quiz-orm.query.repository';
import { IsUserParticipantInQuizGuard } from '../../../infrastructure/guards/forbidden-guards/is-user-participant-in-quiz.guard';
import { SingleStatisticOutputModel } from './models/output/single-statistic.output.model';
import {
  QueryQuizInputModel,
  QueryStatisticInputModel,
} from './models/input/query-quiz.input.model';
import { AllStatisticOutputModel } from './models/output/all-statistics.output.model';

@Controller('/hometask-nest/pair-game-quiz')
export class QuizPublicController {
  constructor(
    protected commandBus: CommandBus,
    protected quizOrmQueryRepository: QuizOrmQueryRepository,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Get('pairs/my-current')
  async getMyCurrentGame(
    @CurrentUserId() userId: string,
  ): Promise<QuizOutputModel> {
    const result = await this.quizOrmQueryRepository.getCurrentQuizByUserId(
      userId,
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessGuard)
  @Get('pairs/my')
  async getAllMyQuizzes(
    @Query() query: QueryQuizInputModel,
    @CurrentUserId() userId: string,
  ): Promise<AllQuizzesOutputModel> {
    const result = await this.quizOrmQueryRepository.getAllMyQuizzes(
      userId,
      query,
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessGuard, IsUserParticipantInQuizGuard)
  @Get('pairs/:quizId')
  async getQuizById(@Param('quizId') quizId: string): Promise<QuizOutputModel> {
    const result = await this.quizOrmQueryRepository.getQuizByIdView(quizId);

    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessGuard)
  @Get('users/my-statistic')
  async getMyStatistic(
    @CurrentUserId() userId: string,
  ): Promise<SingleStatisticOutputModel> {
    const result = await this.quizOrmQueryRepository.getMyStatistic(userId);
    if (!result) throw new NotFoundException();
    return result;
  }

  @Get('users/top')
  async getStatisticOfAllUsers(
    @Query() query: QueryStatisticInputModel,
  ): Promise<AllStatisticOutputModel | void> {
    console.log(query);
    const result = await this.quizOrmQueryRepository.getStatisticOfAllUsers(
      query,
    );

    return result;
  }

  @UseGuards(JwtAccessGuard)
  @HttpCode(200)
  @Post('pairs/connection')
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
  @Post('pairs/my-current/answers')
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
