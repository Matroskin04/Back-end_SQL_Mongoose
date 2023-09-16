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
import { AllLikeStatusEnum } from '../../../infrastructure/utils/enums/like-status';

@Entity()
@Unique(['userId', 'postId'])
@Check('"likeStatus" = ANY (ARRAY[0, 1, 2])')
export class PostsLikesInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('smallint')
  likeStatus: AllLikeStatusEnum;

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
