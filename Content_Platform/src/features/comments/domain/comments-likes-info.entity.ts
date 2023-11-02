import {
  Check,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Users } from '../../users/domain/users.entity';
import { Posts } from '../../posts/domain/posts.entity';
import { Comments } from './comments.entity';
import { LikeDislikeStatusEnum } from '../../../infrastructure/utils/enums/like-status.enums';

@Entity()
@Unique(['userId', 'commentId'])
@Check('"likeStatus" = ANY (ARRAY[0, 1, 2])')
export class CommentsLikesInfo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('smallint')
  likeStatus: LikeDislikeStatusEnum;

  @ManyToOne(() => Users, (u) => u.commentLikeInfo)
  @JoinColumn()
  user: Users;
  @Column()
  userId: string;

  @ManyToOne(() => Comments, (c) => c.commentLikeInfo)
  @JoinColumn()
  comment: Comments;
  @Column()
  commentId: string;
}
