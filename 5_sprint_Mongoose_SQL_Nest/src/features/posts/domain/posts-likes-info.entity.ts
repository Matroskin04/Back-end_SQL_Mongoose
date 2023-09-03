import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Users } from '../../users/domain/users.entity';
import { Posts } from './posts.entity';

@Entity()
@Unique(['userId', 'postId'])
@Check('"likeStatus" = ANY (ARRAY[0, 1, 2])')
export class PostsLikesInfo {
  //todo обязательно есть primary key
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('smallint')
  likeStatus;

  @CreateDateColumn()
  addedAt: Date;

  @ManyToOne(() => Users, (u) => u.postLikeInfo)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;

  @ManyToOne(() => Posts, (p) => p.postLikeInfo)
  @JoinColumn()
  post: Posts;
  @Column()
  postId: string;
}
