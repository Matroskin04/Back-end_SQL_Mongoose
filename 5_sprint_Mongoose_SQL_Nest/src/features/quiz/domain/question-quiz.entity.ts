import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class QuestionQuiz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 500 })
  body: string;

  @Column('simple-array', { nullable: true })
  correctAnswers: string[];

  @Column({ default: false })
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  updatedAt: Date;
}
