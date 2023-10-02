import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { QuestionsOrmQueryRepository } from '../infrastructure/typeORM/query.repository/questions/questions-orm.query.repository';
import { JwtAccessGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { QuizOutputModel } from './models/output/quiz.output.model';
import { ConnectToQuizCommand } from '../application/sa/use-cases/public/connect-to-quiz.use-case';
import { SendAnswerInputModel } from './models/input/send-answer.input.model';
import { AnswerOutputModel } from './models/output/answer.output.model';

@Controller('/hometask-nest/pair-game-quiz/pairs')
export class QuizPublicController {
  constructor(
    protected commandBus: CommandBus,
    protected quizQueryRepository: QuestionsOrmQueryRepository,
  ) {}
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
      new ConnectToQuizCommand(userId),
    );
    return result;
  }
}
