import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/domain/users.entity';
import { Quiz } from './quiz.entity';

@Entity()
export class QuizInfoAboutUser {
  constructor(quizId: string, userId: string) {
    this.quizId = quizId;
    this.userId = userId;
  }
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'smallint', default: 0 })
  score: number;

  @ManyToOne(() => Quiz, (q) => q.quizGameInfoAboutUser)
  @JoinColumn()
  quiz: Quiz;
  @Column()
  quizId: string;

  @ManyToOne(() => Users, (u) => u.quizGameInfoAboutUser)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;
}

//todo add answers like join
