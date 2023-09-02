import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/domain/user.entity';
import { Post } from '../../posts/domain/post.entity';
import { Comment } from './comment.entity';

@Entity()
@Unique(['userId', 'commentId'])
@Check('"likeStatus" = ANY (ARRAY[0, 1, 2])')
export class CommentLikeInfo {
  //todo обязательно есть primary key
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('smallint')
  likeStatus;

  @ManyToOne(() => User, (u) => u.commentLikeInfo)
  @JoinColumn()
  user: User;
  @Column()
  userId: string;

  @ManyToOne(() => Comment, (c) => c.commentLikeInfo)
  @JoinColumn()
  comment: Comment;
  @Column()
  commentId: string;
}
