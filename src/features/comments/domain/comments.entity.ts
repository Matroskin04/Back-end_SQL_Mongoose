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
import { CommentsLikesInfo } from './comments-likes-info.entity';

@Entity()
export class Comments {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 300 })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Users, (u) => u.comment)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;

  @ManyToOne(() => Posts, (p) => p.comment)
  @JoinColumn()
  post: Posts;
  @Column()
  postId: string;

  @OneToMany(() => CommentsLikesInfo, (li) => li.comment)
  commentLikeInfo: CommentsLikesInfo[];
}
