import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Users } from '../../users/domain/users.entity';
import { Posts } from '../../posts/domain/posts.entity';
import { BannedUsersOfBlog } from './banned-users-of-blog.entity';

@Entity()
export class Blogs {
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

  @Column({ nullable: true })
  banDate: Date | null;

  @ManyToOne(() => Users, (u) => u.blog)
  @JoinColumn()
  user: Users;
  @Column({ nullable: true })
  userId: string | null;

  @OneToMany(() => Posts, (p) => p.blog)
  post: Posts[];

  @OneToMany(() => BannedUsersOfBlog, (bu) => bu.blog)
  bannedUsersOfBlog: BannedUsersOfBlog[];
}
