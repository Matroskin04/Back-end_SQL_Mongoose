import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/domain/users.entity';
import { Quiz } from './quiz.entity';
import { QuestionQuiz } from './question-quiz.entity';

@Entity()
export class QuestionQuizConnection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Quiz, (q) => q.questionQuizConnection)
  @JoinColumn()
  quiz: Quiz;
  @Column()
  quizId: string;

  @ManyToOne(() => QuestionQuiz, (q) => q.questionQuizConnection)
  @JoinColumn()
  question: QuestionQuiz;
  @Column()
  questionId: string;
}
