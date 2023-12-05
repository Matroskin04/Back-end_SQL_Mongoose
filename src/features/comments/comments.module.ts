import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { UsersSaController } from '../users/api/sa/users-sa.controller';
import { UsersBloggerController } from '../users/api/blogger/users-blogger.controller';
import { CryptoAdapter } from '../../infrastructure/adapters/crypto.adapter';
import { Users } from '../users/domain/users.entity';
import { UsersPasswordRecovery } from '../users/domain/users-password-recovery.entity';
import { UsersEmailConfirmation } from '../users/domain/users-email-confirmation.entity';
import { UsersBanInfo } from '../users/domain/users-ban-info.entity';
import { BannedUsersOfBlog } from '../blogs/domain/banned-users-of-blog.entity';
import { Devices } from '../devices/domain/devices.entity';
import { Blogs } from '../blogs/domain/blogs.entity';
import { UsersQueryRepository } from '../users/infrastructure/SQL/query.repository/users.query.repository';
import { UsersOrmQueryRepository } from '../users/infrastructure/typeORM/query.repository/users-orm.query.repository';
import { BlogsOrmQueryRepository } from '../blogs/infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import { UsersRepository } from '../users/infrastructure/SQL/repository/users.repository';
import { UsersOrmRepository } from '../users/infrastructure/typeORM/repository/users-orm.repository';
import { DevicesOrmRepository } from '../devices/infrastructure/typeORM/repository/devices-orm.repository';
import { EmailConfirmationOrmRepository } from '../users/infrastructure/typeORM/subrepository/email-confirmation-orm.public.repository';
import { PasswordRecoveryOrmRepository } from '../users/infrastructure/typeORM/subrepository/password-recovery-orm.public.repository';
import { UserBanInfoOrmRepository } from '../users/infrastructure/typeORM/subrepository/ban-info-orm.public.repository';
import { CreateUserUseCase } from '../users/application/sa/use-cases/create-user.use-case';
import { UpdateBanInfoOfUserUseCase } from '../users/application/sa/use-cases/update-ban-info-of-user.use-case';
import { UpdateUserBanInfoForBlogUseCase } from '../users/application/blogger/use-cases/update-user-ban-info-for-blog.use-case';
import { DeleteUserUseCase } from '../users/application/sa/use-cases/delete-user.use-case';
import { CommentsOrmQueryRepository } from './infrastructure/typeORM/query.repository/comments-orm.query.repository';
import { CommentsQueryRepository } from './infrastructure/SQL/query.repository/comments.query.repository';
import { CommentsRepository } from './infrastructure/SQL/repository/comments.repository';
import { CommentsLikesRepository } from './infrastructure/SQL/subrepository/comments-likes.repository';
import { CommentsOrmRepository } from './infrastructure/typeORM/repository/comments-orm.repository';
import { CommentsLikesOrmRepository } from './infrastructure/typeORM/subrepository/comments-likes-orm.repository';
import { CreateCommentUseCase } from './application/use-cases/create-comment-by-post-id.use-case';
import { UpdateCommentUseCase } from './application/use-cases/update-comment.use-case';
import { UpdateCommentLikeStatusUseCase } from './application/use-cases/update-comment-like-status.use-case';
import { DeleteCommentUseCase } from './application/use-cases/delete-comment.use-case';
import { Comments } from './domain/comments.entity';
import { CommentsLikesInfo } from './domain/comments-likes-info.entity';
import { CommentsController } from './api/comments.controller';
import { PostsOrmQueryRepository } from '../posts/infrastructure/typeORM/query.repository/posts-orm.query.repository';
import { LikesInfoOrmRepository } from '../likes-info/infrastructure/typeORM/repository/likes-info-orm.repository';
import { LikesInfoOrmQueryRepository } from '../likes-info/infrastructure/typeORM/query.repository/likes-info-orm.query.repository';
import { PostsLikesInfo } from '../posts/domain/posts-likes-info.entity';
import { PostsQueryRepository } from '../posts/infrastructure/SQL/query.repository/posts.query.repository';
import { Posts } from '../posts/domain/posts.entity';
import { BlogsQueryRepository } from '../blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { UsersModule } from '../users/users.module';

const entities = [
  Comments,
  CommentsLikesInfo,
  PostsLikesInfo,
  Posts,
  Users,
  BannedUsersOfBlog,
  UsersEmailConfirmation,
  Blogs,
  BannedUsersOfBlog,
];
const queryRepositories = [
  CommentsOrmQueryRepository,
  CommentsQueryRepository,
  PostsOrmQueryRepository,
  PostsQueryRepository,
  LikesInfoOrmQueryRepository,
  BlogsQueryRepository,
  BlogsOrmQueryRepository,
];
const repositories = [
  CommentsRepository,
  CommentsLikesRepository,
  CommentsOrmRepository,
  CommentsLikesOrmRepository,
  LikesInfoOrmRepository,
];
const useCases = [
  CreateCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  DeleteCommentUseCase,
];
@Module({
  imports: [TypeOrmModule.forFeature([...entities]), CqrsModule, UsersModule],
  controllers: [CommentsController],
  providers: [...useCases, ...repositories, ...queryRepositories],
  exports: [TypeOrmModule],
})
export class CommentsModule {}
