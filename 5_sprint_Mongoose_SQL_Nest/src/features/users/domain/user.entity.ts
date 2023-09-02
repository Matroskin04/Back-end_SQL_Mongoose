import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserPasswordRecovery } from './user-password-recovery.entity';
import { UserEmailConfirmation } from './user-email-confirmation.entity';
import { UserBanInfo } from './user-ban-info.entity';
import { Blog } from '../../blogs/domain/blog.entity';
import { Post } from '../../posts/domain/post.entity';
import { Comment } from '../../comments/domain/comment.entity';
import { BannedUserOfBlog } from '../../blogs/domain/banned-users-of-blog.entity';
import { PostLikeInfo } from '../../posts/domain/post-like-info.entity';
import { CommentLikeInfo } from '../../comments/domain/comment-like-info.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 10 })
  login: string;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ default: false })
  isDeleted: boolean;

  @OneToOne(() => UserPasswordRecovery, (pr) => pr.user)
  userPasswordRecovery: UserPasswordRecovery;

  @OneToOne(() => UserEmailConfirmation, (ec) => ec.user)
  userEmailConfirmation: UserEmailConfirmation;

  @OneToOne(() => UserBanInfo, (bi) => bi.user)
  userBanInfo: UserBanInfo;

  @OneToMany(() => Blog, (b) => b.user)
  blog: Blog[];

  @OneToMany(() => Post, (p) => p.user)
  post: Post[];

  @OneToMany(() => Comment, (c) => c.user)
  comment: Comment[];

  @OneToMany(() => BannedUserOfBlog, (bu) => bu.user)
  bannedUsersOfBlog: BannedUserOfBlog[];

  @OneToMany(() => PostLikeInfo, (li) => li.user)
  postLikeInfo: PostLikeInfo[];

  @OneToMany(() => CommentLikeInfo, (li) => li.user)
  commentLikeInfo: CommentLikeInfo[];
}
