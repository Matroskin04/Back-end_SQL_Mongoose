import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizStatusEnum } from '../../../infrastructure/utils/enums/quiz.enums';
import { Users } from '../../users/domain/users.entity';
import { QuestionQuizRelation } from './question-quiz-relation.entity';
import { AnswerQuiz } from './answer-quiz.entity';
import { QuizInfoAboutUser } from './quiz-info-about-user.entity';

@Entity()
export class Quiz {
  constructor(user1Id: string) {
    this.user1Id = user1Id;
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: QuizStatusEnum,
    default: QuizStatusEnum['PendingSecondPlayer'],
  })
  status: QuizStatusEnum;

  @CreateDateColumn({ type: 'timestamp without time zone' })
  pairCreatedDate: Date;

  @Column({ type: 'timestamp without time zone', nullable: true })
  startGameDate: Date | null;

  @Column({ type: 'timestamp without time zone', nullable: true })
  finishGameDate: Date | null;

  @ManyToOne(() => Users, (u) => u.quiz1)
  @JoinColumn()
  user1: Users;
  @Column({ type: 'uuid', nullable: true })
  user1Id: string | null;

  @ManyToOne(() => Users, (u) => u.quiz2)
  @JoinColumn()
  user2: Users;
  @Column({ type: 'uuid', nullable: true })
  user2Id: string | null;

  @OneToMany(() => QuizInfoAboutUser, (qi) => qi.quiz)
  quizGameInfoAboutUser: QuizInfoAboutUser;

  @OneToMany(() => QuestionQuizRelation, (q) => q.quiz)
  questionsQuiz: QuestionQuizRelation[];

  @OneToMany(() => AnswerQuiz, (aq) => aq.quiz)
  answersQuiz: AnswerQuiz[];
}
