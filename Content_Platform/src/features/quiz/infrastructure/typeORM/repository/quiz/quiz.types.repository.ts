import { QuizStatusEnum } from '../../../../../../infrastructure/utils/enums/quiz.enums';

export type QuizRawInfoType = {
  id: string;
  status: QuizStatusEnum;
  pairCreatedDate: Date;
  startGameDate: Date | null;
  finishGameDate: Date | null;
  user1Id: string | null;
  user2Id: string | null;
};
