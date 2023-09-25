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

  @Column({ length: 15 })
  body: string;

  @Column('simple-array')
  correctAnswers: string[];

  @Column()
  published: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}
