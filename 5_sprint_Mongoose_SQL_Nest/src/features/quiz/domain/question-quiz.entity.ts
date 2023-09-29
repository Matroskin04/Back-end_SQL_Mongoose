import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { QuestionQuizConnection } from './question-quiz-connection.entity';

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

  @OneToMany(() => QuestionQuizConnection, (q) => q.question)
  questionQuizConnection: QuestionQuizConnection[];
}
