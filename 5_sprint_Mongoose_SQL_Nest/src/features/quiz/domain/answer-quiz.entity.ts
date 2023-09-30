import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuizAnswerStatusEnum } from '../../../infrastructure/utils/enums/quiz.enums';
import { Users } from '../../users/domain/users.entity';
import { QuestionQuiz } from './question-quiz.entity';
import { Quiz } from './quiz.entity';

@Entity()
export class AnswerQuiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: QuizAnswerStatusEnum })
  answerStatus: QuizAnswerStatusEnum;

  @CreateDateColumn()
  addedAt: Date;

  @ManyToOne(() => Quiz, (q) => q.answersQuiz)
  @JoinColumn()
  quiz: Quiz;
  @Column()
  quizId: string;

  @OneToOne(() => Users, (u) => u.answerQuiz)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;

  @ManyToOne(() => QuestionQuiz, (q) => q.answersQuiz)
  @JoinColumn()
  question: QuestionQuiz;
  @Column()
  questionId: string;
}
