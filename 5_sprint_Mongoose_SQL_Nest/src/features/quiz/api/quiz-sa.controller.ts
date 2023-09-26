import {
  Body,
  Controller,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../../../infrastructure/guards/authorization-guards/basic-auth.guard';
import { CreateQuestionQuizInputModel } from './models/input/create-question-quiz.input.model';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuestionQuizCommand } from '../application/sa/use-cases/create-question-quiz.use-case';
import { QuestionSaOutputModel } from './models/output/question-sa.output.model';
import { UpdateQuestionQuizInputModel } from './models/input/update-question-quiz.input.model';

@Controller('/hometask-nest/sa/quiz')
export class QuizSaController {
  constructor(protected commandBus: CommandBus) {}

  @UseGuards(BasicAuthGuard)
  @Post('questions')
  async createQuestionQuiz(
    @Body() inputQuestionModel: CreateQuestionQuizInputModel,
  ): Promise<QuestionSaOutputModel> {
    const result = await this.commandBus.execute(
      new CreateQuestionQuizCommand(
        inputQuestionModel.body,
        inputQuestionModel.correctAnswers,
      ),
    );
    return result;
  }

  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  @Post('questions/:id')
  async updateQuestionQuizById(
    @Param('id') id: string,
    @Body() inputQuestionModel: UpdateQuestionQuizInputModel,
  ): Promise<void> {
    const result = false || true;
    if (!result) throw new NotFoundException();
    return;
  }
}
