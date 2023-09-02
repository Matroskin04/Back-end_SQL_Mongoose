import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { Post } from '../../posts/domain/post.entity';
import { BannedUsersOfBlog } from './banned-users-of-blog.entity';

@Entity()
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 15 })
  name: string;

  @Column({ length: 500 })
  description: string;

  @Column({ length: 100 })
  websiteUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  isMembership: boolean;

  @Column({ default: false })
  isBanned: boolean;

  @Column()
  banDate: Date;

  @ManyToOne(() => User, (u) => u.blog)
  @JoinColumn()
  user: User;
  @Column()
  userId: string;

  @OneToMany(() => Post, (p) => p.blog)
  post: Post[];

  @OneToMany(() => BannedUsersOfBlog, (bu) => bu.blog)
  bannedUsersOfBlog: BannedUsersOfBlog[];
}
