import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostsController } from './features/posts/api/posts.controller';
import { PostsQueryRepository } from './features/posts/infrastructure/SQL/query.repository/posts.query.repository';
import { PostsRepository } from './features/posts/infrastructure/SQL/repository/posts.repository';
import { CommentsController } from './features/comments/api/comments.controller';
import { UsersSaController } from './features/users/api/sa/users-sa.controller';
import { CommentsQueryRepository } from './features/comments/infrastructure/query.repository/comments.query.repository';
import { TestingController } from './features/testing/api/testing.controller';
import { TestingRepository } from './features/testing/repository/testing.repository';
import { LocalStrategy } from './infrastructure/strategy/local.strategy';
import { CryptoAdapter } from './infrastructure/adapters/crypto.adapter';
import { EmailManager } from './infrastructure/managers/email-manager';
import { EmailAdapter } from './infrastructure/adapters/email.adapter';
import { AuthController } from './features/auth/api/auth.controller';
import { JwtRefreshStrategy } from './infrastructure/strategy/jwt-refresh.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './infrastructure/strategy/jwt-access.strategy';
import { BasicStrategy } from './infrastructure/strategy/basic.strategy';
import { LikesInfoQueryRepository } from './features/likes-info/infrastructure/query.repository/likes-info.query.repository';
import { LikesInfoRepository } from './features/likes-info/infrastructure/repository/likes-info.repository';
import { CommentsRepository } from './features/comments/infrastructure/repository/comments.repository';
import { IsBlogByIdExistsConstraint } from './infrastructure/decorators/posts/blog-id-exists.decorator';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DevicesController } from './features/devices/api/devices.controller';
import { DevicesQueryRepository } from './features/devices/infrastructure/SQL/query.repository/devices.query.repository';
import { DevicesRepository } from './features/devices/infrastructure/SQL/repository/devices.repository';
import { JwtAdapter } from './infrastructure/adapters/jwt.adapter';
import { BlogsPublicController } from './features/blogs/api/public/blogs-public.controller';
import { BlogsBloggerController } from './features/blogs/api/blogger/blogs-blogger.controller';
import { BlogsQueryRepository } from './features/blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { BlogsRepository } from './features/blogs/infrastructure/SQL/repository/blogs.repository';
import { UsersBloggerController } from './features/users/api/blogger/users-blogger.controller';
import { RegisterUserUseCase } from './features/auth/application/use-cases/register-user.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfirmEmailUseCase } from './features/auth/application/use-cases/confirm-email.use-case';
import { ResendConfirmationEmailMessageUseCase } from './features/auth/application/use-cases/resend-confirmation-email-message.use-case';
import { UpdatePasswordUseCase } from './features/auth/application/use-cases/update-password-use.case';
import { LoginUserUseCase } from './features/auth/application/use-cases/login-user.use-case';
import process from 'process';
import { SendEmailPassRecoveryUseCase } from './features/auth/application/use-cases/send-email-pass-recovery.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordRecoveryPublicRepository } from './features/users/infrastructure/SQL/subrepository/password-recovery.public.repository';
import { BanInfoPublicRepository } from './features/users/infrastructure/SQL/subrepository/ban-info.public.repository';
import { EmailConfirmationPublicRepository } from './features/users/infrastructure/SQL/subrepository/email-confirmation.public.repository';
import { UsersRepository } from './features/users/infrastructure/SQL/repository/users.repository';
import { CreateUserUseCase } from './features/users/application/sa/use-cases/create-user.use-case';
import { DeleteUserUseCase } from './features/users/application/sa/use-cases/delete-user.use-case';
import { UpdateBanInfoOfUserUseCase } from './features/users/application/sa/use-cases/update-ban-info-of-user.use-case';
import { DeleteDevicesExcludeCurrentUseCase } from './features/devices/application/use-cases/delete-devices-exclude-current.use-case';
import { DeleteDeviceByIdUseCase } from './features/devices/application/use-cases/delete-device-by-id.use-case';
import { UsersQueryRepository } from './features/users/infrastructure/SQL/query.repository/users.query.repository';
import { CommentsLikesRepository } from './features/comments/infrastructure/subrepository/comments-likes.repository';
import { IsUserBannedByJWTStrategy } from './infrastructure/strategy/is-user-banned-by-jwt.strategy';
import { Blogs } from './features/blogs/domain/blogs.entity';
import { Users } from './features/users/domain/users.entity';
import { UsersPasswordRecovery } from './features/users/domain/users-password-recovery.entity';
import { UsersEmailConfirmation } from './features/users/domain/users-email-confirmation.entity';
import { UsersBanInfo } from './features/users/domain/users-ban-info.entity';
import { Posts } from './features/posts/domain/posts.entity';
import { Comments } from './features/comments/domain/comments.entity';
import { BannedUsersOfBlog } from './features/blogs/domain/banned-users-of-blog.entity';
import { PostsLikesInfo } from './features/posts/domain/posts-likes-info.entity';
import { CommentsLikesInfo } from './features/comments/domain/comments-likes-info.entity';
import { Devices } from './features/devices/domain/devices.entity';
import { ValidateUserUseCase } from './features/auth/application/use-cases/validate-user.use-case';
import { CreateBlogUseCase } from './features/blogs/application/blogger/use-cases/create-blog.use-case';
import { UpdateBlogUseCase } from './features/blogs/application/blogger/use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from './features/blogs/application/blogger/use-cases/delete-blog.use-case';
import { BindBlogWithUserUseCase } from './features/blogs/application/sa/use-cases/bind-blog-with-user.use-case';
import { UpdateBanInfoOfBlogUseCase } from './features/blogs/application/sa/use-cases/update-ban-info-of-blog.use-case';
import { UpdateCommentUseCase } from './features/comments/application/use-cases/update-comment.use-case';
import {
  DeleteCommentCommand,
  DeleteCommentUseCase,
} from './features/comments/application/use-cases/delete-comment.use-case';
import { CreateCommentUseCase } from './features/comments/application/use-cases/create-comment-by-post-id.use-case';
import { UpdateCommentLikeStatusUseCase } from './features/comments/application/use-cases/update-comment-like-status.use-case';
import { CreatePostUseCase } from './features/posts/application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from './features/posts/application/use-cases/update-post.use-case';
import { UpdatePostLikeStatusUseCase } from './features/posts/application/use-cases/update-post-like-status.use-case';
import { DeletePostUseCase } from './features/posts/application/use-cases/delete-post.use-case';
import { DeleteDevicesByUserIdUseCase } from './features/devices/application/use-cases/delete-devices-by-user-id.use.case';
import { CreateDeviceUseCase } from './features/devices/application/use-cases/create-device.use-case';
import { DeleteDeviceByRefreshTokenUseCase } from './features/devices/application/use-cases/delete-device-by-refresh-token.use-case';
import { UpdateUserBanInfoForBlogUseCase } from './features/users/application/blogger/use-cases/update-user-ban-info-for-blog.use-case';
import { UsersOrmQueryRepository } from './features/users/infrastructure/typeORM/query.repository/users-orm.query.repository';
import { DevicesOrmRepository } from './features/devices/infrastructure/typeORM/repository/devices-orm.repository';
import { UsersOrmRepository } from './features/users/infrastructure/typeORM/repository/users-orm.repository';
import { EmailConfirmationOrmRepository } from './features/users/infrastructure/typeORM/subrepository/email-confirmation-orm.public.repository';
import { PasswordRecoveryOrmRepository } from './features/users/infrastructure/typeORM/subrepository/password-recovery-orm.public.repository';
import { BanInfoOrmRepository } from './features/users/infrastructure/typeORM/subrepository/ban-info-orm.public.repository';
import { APP_GUARD } from '@nestjs/core';
import { BlogsOrmQueryRepository } from './features/blogs/infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import { PostsOrmQueryRepository } from './features/posts/infrastructure/typeORM/query.repository/posts-orm.query.repository';
import { BlogsOrmRepository } from './features/blogs/infrastructure/typeORM/repository/blogs-orm.repository';
import { PostsOrmRepository } from './features/posts/infrastructure/typeORM/repository/posts-orm.repository';
import { BlogsSAController } from './features/blogs/api/sa/blogs-sa.controller';

const queryRepositories = [
  // SQL
  BlogsQueryRepository,
  PostsQueryRepository,
  LikesInfoQueryRepository,
  DevicesQueryRepository,
  CommentsQueryRepository,
  UsersQueryRepository,

  //ORM
  BlogsOrmQueryRepository,
  PostsOrmQueryRepository,
  UsersOrmQueryRepository,
  DevicesOrmRepository,
];
const repositories = [
  //SQL
  PasswordRecoveryPublicRepository,
  BanInfoPublicRepository,
  EmailConfirmationPublicRepository,
  BlogsRepository,
  CommentsRepository,
  CommentsLikesRepository,
  DevicesRepository,
  LikesInfoRepository,
  PostsRepository,
  UsersRepository,
  TestingRepository,

  //ORM
  BlogsOrmRepository,
  PostsOrmRepository,
  UsersOrmRepository,
  EmailConfirmationOrmRepository,
  PasswordRecoveryOrmRepository,
  BanInfoOrmRepository,
];
const handlers = [
  //auth
  RegisterUserUseCase,
  ConfirmEmailUseCase,
  ResendConfirmationEmailMessageUseCase,
  UpdatePasswordUseCase,
  LoginUserUseCase,
  ValidateUserUseCase,
  SendEmailPassRecoveryUseCase,
  //blogs
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  BindBlogWithUserUseCase,
  UpdateBanInfoOfBlogUseCase,
  //posts
  CreatePostUseCase,
  UpdatePostUseCase,
  UpdatePostLikeStatusUseCase,
  DeletePostUseCase,
  //comments
  CreateCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  DeleteCommentUseCase,
  //users
  CreateUserUseCase,
  UpdateBanInfoOfUserUseCase,
  UpdateUserBanInfoForBlogUseCase,
  DeleteUserUseCase,
  //devices
  CreateDeviceUseCase,
  DeleteDeviceByRefreshTokenUseCase,
  DeleteDevicesExcludeCurrentUseCase,
  DeleteDeviceByIdUseCase,
  DeleteDevicesByUserIdUseCase,
];

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot(),
    ConfigModule.forRoot(),
    TypeOrmModule.forFeature([
      Blogs,
      BannedUsersOfBlog,
      Devices,
      Posts,
      PostsLikesInfo,
      Comments,
      CommentsLikesInfo,
      Users,
      UsersPasswordRecovery,
      UsersEmailConfirmation,
      UsersBanInfo,
    ]),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: true,
      synchronize: true,
      // url: process.env.POSTGRES_URL + '?sslmode=require',
    }),
    JwtModule.register({}),
  ],
  controllers: [
    AuthController,
    BlogsPublicController,
    BlogsBloggerController,
    BlogsSAController,
    DevicesController,
    PostsController,
    CommentsController,
    UsersSaController,
    UsersBloggerController,
    TestingController,
  ],
  providers: [
    ...queryRepositories,
    ...repositories,
    IsBlogByIdExistsConstraint,
    //Strategy
    LocalStrategy,
    JwtRefreshStrategy,
    JwtAccessStrategy,
    BasicStrategy,
    IsUserBannedByJWTStrategy,

    //Managers && Adapters
    EmailManager,
    CryptoAdapter,
    EmailAdapter,
    JwtAdapter,
    //handlers
    ...handlers,

    //Throttler
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
