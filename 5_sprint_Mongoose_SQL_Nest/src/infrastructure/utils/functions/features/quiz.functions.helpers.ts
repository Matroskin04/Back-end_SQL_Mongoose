import { QuestionQuizAllInfoType } from '../../../../features/quiz/infrastructure/typeORM/repository/questions.types.repository';

export function modifyQuestionIntoViewModel(question): QuestionQuizAllInfoType {
  return {
    id: question.id,
    body: question.body,
    correctAnswers: question.correctAnswers
      ? question.correctAnswers.split(',')
      : null,
    published: question.published,
    createdAt: question.createdAt.toString(),
    updatedAt: question.updatedAt ? question.updatedAt.toString() : null,
  };
}
