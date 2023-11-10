import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Blogs } from './blogs.entity';
import { Users } from '../../users/domain/users.entity';

@Entity()
export class SubscribersOfBlog {
  @ManyToOne(() => Blogs, (b) => b.subscribersOfBlog)
  @JoinColumn()
  blog: Blogs;
  @PrimaryGeneratedColumn()
  blogId: string;

  @ManyToOne(() => Users, (u) => u.subscribersOfBlog)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;
}
