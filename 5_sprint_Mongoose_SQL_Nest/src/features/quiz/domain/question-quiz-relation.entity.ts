import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Quiz } from './quiz.entity';
import { QuestionQuiz } from './question-quiz.entity';

@Entity()
export class QuestionQuizRelation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Quiz, (q) => q.questionsQuiz)
  @JoinColumn()
  quiz: Quiz;
  @Column()
  quizId: string;

  @ManyToOne(() => QuestionQuiz, (q) => q.quiz)
  @JoinColumn()
  question: QuestionQuiz;
  @Column()
  questionId: string;
}
