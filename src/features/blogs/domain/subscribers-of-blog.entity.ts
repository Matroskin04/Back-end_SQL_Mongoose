import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blogs } from './blogs.entity';
import { Users } from '../../users/domain/users.entity';
import { QuizStatusEnum } from '../../../infrastructure/utils/enums/quiz.enums';
import { SubscriptionStatusEnum } from '../../../infrastructure/utils/enums/blogs-subscribers.enums';

@Entity()
export class SubscribersOfBlog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatusEnum,
  })
  subscriptionStatus: SubscriptionStatusEnum;

  @ManyToOne(() => Blogs, (b) => b.subscribersOfBlog)
  @JoinColumn()
  blog: Blogs;
  @Column('uuid')
  blogId: string;

  @ManyToOne(() => Users, (u) => u.subscribersOfBlog)
  @JoinColumn()
  user: Users;
  @Column('uuid')
  userId: string;
}
