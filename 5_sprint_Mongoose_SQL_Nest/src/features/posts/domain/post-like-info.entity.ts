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
import { Post } from './post.entity';

@Entity()
@Unique(['userId', 'postId'])
@Check('"likeStatus" = ANY (ARRAY[0, 1, 2])')
export class PostLikeInfo {
  //todo обязательно есть primary key
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('smallint')
  likeStatus;

  @ManyToOne(() => User, (u) => u.postLikeInfo)
  @JoinColumn()
  user: User;
  @Column()
  userId: string;

  @ManyToOne(() => Post, (p) => p.postLikeInfo)
  @JoinColumn()
  post: Post;
  @Column()
  postId: string;
}
