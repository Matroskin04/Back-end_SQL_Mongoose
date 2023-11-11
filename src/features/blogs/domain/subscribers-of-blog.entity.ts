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
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
