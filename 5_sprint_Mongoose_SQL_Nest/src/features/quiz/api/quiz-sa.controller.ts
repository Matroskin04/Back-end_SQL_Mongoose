import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { BasicAuthGuard } from '../../../infrastructure/guards/authorization-guards/basic-auth.guard';
import { CreateQuestionQuizInputModel } from './models/input/create-question-quiz.input.model';
import { QuestionSaOutputModel } from './models/output/question-sa.output.model';

@Controller('/hometask-nest/sa/quiz')
export class QuizSaController {
  constructor() {}

  @UseGuards(BasicAuthGuard)
  @Post('questions')
  async createQuestionQuiz(
    @Body() inputQuestionModel: CreateQuestionQuizInputModel,
  ): Promise<QuestionSaOutputModel> {
    const result = [];
    return {
      id: 'string',
      body: 'string',
      correctAnswers: ['string'],
      published: false,
      createdAt: '2023-09-25T08:14:32.307Z',
      updatedAt: '2023-09-25T08:14:32.307Z',
    };
  }
}
