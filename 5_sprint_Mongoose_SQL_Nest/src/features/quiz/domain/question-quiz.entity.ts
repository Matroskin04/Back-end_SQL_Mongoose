import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionQuizRelation } from './question-quiz-relation.entity';
import { AnswerQuiz } from './answer-quiz.entity';

@Entity()
export class QuestionQuiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500, nullable: true, type: 'varchar' })
  body: string | null;

  @Column('simple-array', { nullable: true })
  correctAnswers: string[] | null;

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, type: 'timestamp without time zone' })
  updatedAt: Date | null;

  @OneToMany(() => QuestionQuizRelation, (q) => q.question)
  quiz: QuestionQuizRelation[];

  @OneToMany(() => AnswerQuiz, (aq) => aq.question)
  answersQuiz: AnswerQuiz[];
}
