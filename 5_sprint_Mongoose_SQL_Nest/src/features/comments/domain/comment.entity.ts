import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { Post } from '../../posts/domain/post.entity';
import { CommentLikeInfo } from './comment-like-info.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 300 })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (u) => u.comment)
  @JoinColumn()
  user: User;
  @Column()
  userId: string;

  @ManyToOne(() => Post, (p) => p.comment)
  @JoinColumn()
  post: Post;
  @Column()
  postId: string;

  @OneToMany(() => CommentLikeInfo, (li) => li.comment)
  commentLikeInfo: CommentLikeInfo[];
}
