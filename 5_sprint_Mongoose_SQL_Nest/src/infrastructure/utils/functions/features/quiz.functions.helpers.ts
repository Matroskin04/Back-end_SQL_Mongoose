import { QuestionQuizAllInfoType } from '../../../../features/quiz/infrastructure/typeORM/repository/quiz.types.repository';

export function modifyQuestionIntoViewModel(question): QuestionQuizAllInfoType {
  return {
    id: question.id,
    body: question.body,
    correctAnswers: question.correctAnswers,
    published: question.published,
    createdAt: question.createdAt.toString(),
    updatedAt: question.updatedAt ? null : question.updatedAt.toString(),
  };
}
