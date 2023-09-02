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
import { Blog } from '../../blogs/domain/blog.entity';
import { Comment } from '../../comments/domain/comment.entity';
import { PostLikeInfo } from './post-like-info.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 30 })
  title: string;

  @Column({ length: 100 })
  shortDescription: string;

  @Column()
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (u) => u.post)
  @JoinColumn()
  user: User;
  @Column()
  userId: string;

  @ManyToOne(() => Blog, (b) => b.post)
  @JoinColumn()
  blog: Blog;
  @Column()
  blogId: string;

  @OneToMany(() => Comment, (c) => c.post)
  comment: Comment[];

  @OneToMany(() => PostLikeInfo, (li) => li.post)
  postLikeInfo: PostLikeInfo[];
}
