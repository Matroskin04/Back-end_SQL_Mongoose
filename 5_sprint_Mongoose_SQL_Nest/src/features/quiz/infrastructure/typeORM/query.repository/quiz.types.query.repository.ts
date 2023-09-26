export type QuestionQuizAllInfoType = {
  id: string;
  body: string | null;
  correctAnswers: string[] | null;
  published: boolean;
  createdAt: string;
  updatedAt: string | null;
};

export type AnswersOfQuestionType = { correctAnswers: string[] };
