import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersPasswordRecovery } from './users-password-recovery.entity';
import { UsersEmailConfirmation } from './users-email-confirmation.entity';
import { UsersBanInfo } from './users-ban-info.entity';
import { Blogs } from '../../blogs/domain/blogs.entity';
import { Posts } from '../../posts/domain/posts.entity';
import { Comments } from '../../comments/domain/comments.entity';
import { BannedUsersOfBlog } from '../../blogs/domain/banned-users-of-blog.entity';
import { PostsLikesInfo } from '../../posts/domain/posts-likes-info.entity';
import { CommentsLikesInfo } from '../../comments/domain/comments-likes-info.entity';
import { Devices } from '../../devices/domain/devices.entity';
import { Quiz } from '../../quiz/domain/quiz.entity';
import { AnswerQuiz } from '../../quiz/domain/answer-quiz.entity';
import { QuizInfoAboutUser } from '../../quiz/domain/quiz-info-about-user.entity';

@Entity()
export class Users {
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

  @OneToOne(() => UsersPasswordRecovery, (pr) => pr.user)
  userPasswordRecovery: UsersPasswordRecovery;

  @OneToOne(() => UsersEmailConfirmation, (ec) => ec.user)
  userEmailConfirmation: UsersEmailConfirmation;

  @OneToOne(() => UsersBanInfo, (bi) => bi.user)
  userBanInfo: UsersBanInfo;

  @OneToMany(() => AnswerQuiz, (aq) => aq.user)
  answerQuiz: AnswerQuiz;

  @OneToMany(() => QuizInfoAboutUser, (qi) => qi.user)
  quizGameInfoAboutUser: QuizInfoAboutUser;

  @OneToMany(() => Blogs, (b) => b.user)
  blog: Blogs[];

  @OneToMany(() => Posts, (p) => p.user)
  post: Posts[];

  @OneToMany(() => Comments, (c) => c.user)
  comment: Comments[];

  @OneToMany(() => BannedUsersOfBlog, (bu) => bu.user)
  bannedUsersOfBlog: BannedUsersOfBlog[];

  @OneToMany(() => PostsLikesInfo, (li) => li.user)
  postLikeInfo: PostsLikesInfo[];

  @OneToMany(() => CommentsLikesInfo, (li) => li.user)
  commentLikeInfo: CommentsLikesInfo[];

  @OneToMany(() => Devices, (d) => d.user)
  device: Devices[];

  @OneToMany(() => Quiz, (q) => q.user1)
  quiz1: Quiz[];

  @OneToMany(() => Quiz, (q) => q.user2)
  quiz2: Quiz[];
}
