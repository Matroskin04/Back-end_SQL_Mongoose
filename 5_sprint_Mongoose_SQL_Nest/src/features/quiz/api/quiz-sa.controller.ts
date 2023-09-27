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
import { CreateQuestionCommand } from '../application/sa/use-cases/create-question.use-case';
import { QuestionSaOutputModel } from './models/output/question-sa.output.model';
import { UpdateQuestionInputModel } from './models/input/update-question.input.model';
import { UpdateQuestionCommand } from '../application/sa/use-cases/update-question.use-case';
import { DeleteQuestionCommand } from '../application/sa/use-cases/delete-question.use-case';
import { PublishQuestionUseCase } from './models/input/publish-question.input.model';
import { PublishQuestionCommand } from '../application/sa/use-cases/publish-question.use-case';
import { QueryQuestionsInputModel } from './models/input/query-questions.input.model';

@Controller('/hometask-nest/sa/quiz/questions')
export class QuizSaController {
  constructor(protected commandBus: CommandBus) {}

  @UseGuards(BasicAuthGuard)
  @Get()
  async getAllQuestions(@Query() query: QueryQuestionsInputModel) {}
  @UseGuards(BasicAuthGuard)
  @Post()
  async createQuestion(
    @Body() inputQuestionModel: CreateQuestionInputModel,
  ): Promise<QuestionSaOutputModel> {
    const result = await this.commandBus.execute(
      new CreateQuestionCommand(
        inputQuestionModel.body,
        inputQuestionModel.correctAnswers,
      ),
    );
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  @Put(':id')
  async updateQuestionById(
    @Param('id') questionId: string,
    @Body() inputQuestionModel: UpdateQuestionInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new UpdateQuestionCommand(
        questionId,
        inputQuestionModel.body,
        inputQuestionModel.correctAnswers,
      ),
    );
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  @Put(':id/publish')
  async publishQuestionById(
    @Param('id') questionId: string,
    @Body() inputQuestionModel: PublishQuestionUseCase,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new PublishQuestionCommand(questionId, inputQuestionModel.published),
    );
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  @Delete(':id')
  async deleteQuestionById(@Param('id') questionId: string): Promise<void> {
    const result = await this.commandBus.execute(
      new DeleteQuestionCommand(questionId),
    );

    if (!result) throw new NotFoundException();
    return;
  }
}
