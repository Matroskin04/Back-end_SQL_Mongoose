import { QuizAnswerStatusType } from '../../../../../infrastructure/types/quiz-questions.general.types';

export type AnswerOutputModel = {
  questionId: string;
  answerStatus: QuizAnswerStatusType;
  addedAt: string;
};
