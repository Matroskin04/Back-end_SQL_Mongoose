import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Users } from '../../users/domain/users.entity';
import { Blogs } from './blogs.entity';

@Entity()
@Unique(['userId', 'blogId'])
export class BannedUsersOfBlog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  isBanned: boolean;

  @Column({ nullable: true })
  banReason: string;

  @CreateDateColumn({ type: 'timestamp without time zone', nullable: true })
  banDate: Date | null;

  @ManyToOne(() => Users, (u) => u.bannedUsersOfBlog)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;

  @ManyToOne(() => Blogs, (b) => b.bannedUsersOfBlog)
  @JoinColumn()
  blog: Blogs;
  @Column()
  blogId: string;
}
