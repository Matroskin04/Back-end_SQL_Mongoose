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
import { PostsLikesInfo } from '../../posts/domain/posts-likes-info.entity';
import { QuestionQuizConnection } from './question-quiz-connection.entity';

@Entity()
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('smallint')
  numberAnswers1: number;

  @Column('smallint')
  numberAnswers2: number;

  @Column({ type: 'enum', enum: QuizStatusEnum })
  status: QuizStatusEnum;

  @CreateDateColumn()
  pairCreatedDate: Date;

  @Column({ type: 'timestamp without time zone', nullable: true })
  startGameDate: Date | null;

  @Column({ type: 'timestamp without time zone', nullable: true })
  finishGameDate: Date | null;

  @ManyToOne(() => Users, (u) => u.quiz1)
  @JoinColumn()
  user1: Users;
  @Column({ type: 'uuid', nullable: true })
  userId1: string | null;

  @ManyToOne(() => Users, (u) => u.quiz2)
  @JoinColumn()
  user2: Users;
  @Column({ type: 'uuid', nullable: true })
  userId2: string | null;

  @OneToMany(() => QuestionQuizConnection, (q) => q.quiz)
  questionQuizConnection: QuestionQuizConnection[];
}
