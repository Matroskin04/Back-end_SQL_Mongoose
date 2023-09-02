import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { Blog } from './blog.entity';

@Entity()
@Unique(['userId', 'blogId'])
export class BannedUsersOfBlog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  isBanned: boolean;

  @Column()
  banReason: string;

  @CreateDateColumn()
  banDate: Date;

  @ManyToOne(() => User, (u) => u.bannedUsersOfBlog)
  @JoinColumn()
  user: User;
  @Column()
  userId: string;

  @ManyToOne(() => Blog, (b) => b.bannedUsersOfBlog)
  @JoinColumn()
  blog: Blog;
  @Column()
  blogId: string;
}
