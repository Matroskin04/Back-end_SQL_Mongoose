import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizStatusEnum } from '../../../infrastructure/utils/enums/quiz.enums';
import { Users } from '../../users/domain/users.entity';
import { QuestionQuizConnection } from './question-quiz-connection.entity';
import { AnswerQuiz } from './answer-quiz.entity';
import { QuizGameInfoAboutUser } from './quiz-game-info-about-user.entity';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: QuizStatusEnum })
  status: QuizStatusEnum;

  @CreateDateColumn()
  pairCreatedDate: Date;

  @Column({ type: 'timestamp without time zone', nullable: true })
  startGameDate: Date | null;

  @Column({ type: 'timestamp without time zone', nullable: true })
  finishGameDate: Date | null;

  @OneToOne(() => QuizGameInfoAboutUser, (qi) => qi.quiz)
  quizGameInfoAboutUser: QuizGameInfoAboutUser;

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

  @OneToMany(() => QuestionQuizConnection, (q) => q.quiz)
  questionsQuiz: QuestionQuizConnection[];

  @OneToMany(() => AnswerQuiz, (aq) => aq.quiz)
  answersQuiz: AnswerQuiz[];
}
