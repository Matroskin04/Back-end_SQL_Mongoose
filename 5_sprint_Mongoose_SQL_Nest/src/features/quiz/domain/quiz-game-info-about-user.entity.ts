import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/domain/users.entity';
import { Quiz } from './quiz.entity';

@Entity()
export class QuizGameInfoAboutUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('smallint')
  numberOfAnswers: number;

  @Column('smallint')
  score: number;

  @OneToOne(() => Quiz, (q) => q.quizGameInfoAboutUser)
  @JoinColumn()
  quiz: Quiz;
  @Column()
  quizId: string;

  @OneToOne(() => Users, (u) => u.quizGameInfoAboutUser)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;
}
