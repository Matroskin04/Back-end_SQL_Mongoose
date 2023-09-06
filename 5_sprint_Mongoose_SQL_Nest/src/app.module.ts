import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PostsController } from './features/posts/api/posts.controller';
import { PostsService } from './features/posts/application/posts.service';
import { PostsQueryRepository } from './features/posts/infrastructure/query.repository/posts.query.repository';
import { PostsRepository } from './features/posts/infrastructure/repository/posts.repository';
import { CommentsController } from './features/comments/api/comments.controller';
import { UsersSaController } from './features/users/api/sa/users-sa.controller';
import { CommentsQueryRepository } from './features/comments/infrastructure/query.repository/comments.query.repository';
import { UsersSaService } from './features/users/application/sa/users-sa.service';
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
import { DevicesService } from './features/devices/application/devices.service';
import { DevicesQueryRepository } from './features/devices/infrastructure/query.repository/devices.query.repository';
import { DevicesRepository } from './features/devices/infrastructure/repository/devices.repository';
import { JwtAdapter } from './infrastructure/adapters/jwt.adapter';
import { BlogsPublicController } from './features/blogs/api/public/blogs-public.controller';
import { BlogsBloggerController } from './features/blogs/api/blogger/blogs-blogger.controller';
import { BlogsQueryRepository } from './features/blogs/infrastructure/query.repository/blogs.query.repository';
import { BlogsRepository } from './features/blogs/infrastructure/repository/blogs.repository';
import { UsersBloggerService } from './features/users/application/blogger/users-blogger.service';
import { UsersBloggerController } from './features/users/api/blogger/users-blogger.controller';
import { RegisterUserUseCase } from './features/auth/application/use-cases/register-user.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfirmEmailUseCase } from './features/auth/application/use-cases/confirm-email.use-case';
import { ResendConfirmationEmailMessageUseCase } from './features/auth/application/use-cases/resend-confirmation-email-message.use-case';
import { SaveNewPassUseCase } from './features/auth/application/use-cases/save-new-pass.use-case';
import { LoginUserUseCase } from './features/auth/application/use-cases/login-user.use-case';
import process from 'process';
import { SendEmailPassRecoveryUseCase } from './features/auth/application/use-cases/send-email-pass-recovery.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordRecoveryPublicRepository } from './features/users/infrastructure/subrepository/password-recovery.public.repository';
import { BanInfoPublicRepository } from './features/users/infrastructure/subrepository/ban-info.public.repository';
import { EmailConfirmationPublicRepository } from './features/users/infrastructure/subrepository/email-confirmation.public.repository';
import { UsersRepository } from './features/users/infrastructure/repository/users.repository';
import { CreateUserUseCase } from './features/users/application/sa/use-cases/create-user.use-case';
import { DeleteUserUseCase } from './features/users/application/sa/use-cases/delete-user.use-case';
import { UpdateBanInfoOfUserUseCase } from './features/users/application/sa/use-cases/update-ban-info-user.use-case';
import { DeleteDevicesExcludeCurrentUseCase } from './features/devices/application/use-cases/delete-devices-exclude-current.use-case';
import { DeleteDeviceByIdUseCase } from './features/devices/application/use-cases/delete-device-by-id.use-case';
import { UsersQueryRepository } from './features/users/infrastructure/query.repository/users.query.repository';
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
import { DeleteCommentCommand } from './features/comments/application/use-cases/delete-comment.use-case';
import { CreateCommentUseCase } from './features/comments/application/use-cases/create-comment-by-post-id.use-case';
import { UpdateCommentLikeStatusUseCase } from './features/comments/application/use-cases/update-comment-like-status.use-case';
import { CreatePostUseCase } from './features/posts/application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from './features/posts/application/use-cases/update-post.use-case';

const services = [
  DevicesService,
  JwtAdapter,
  UsersSaService,
  UsersBloggerService,
  PostsService,
];
const queryRepositories = [
  BlogsQueryRepository,
  PostsQueryRepository,
  LikesInfoQueryRepository,
  DevicesQueryRepository,
  CommentsQueryRepository,
  UsersQueryRepository,
];
const repositories = [
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
];
const handlers = [
  //auth
  RegisterUserUseCase,
  ConfirmEmailUseCase,
  ResendConfirmationEmailMessageUseCase,
  SaveNewPassUseCase,
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
  //comments
  CreateCommentUseCase,
  UpdateCommentUseCase,
  UpdateCommentLikeStatusUseCase,
  DeleteCommentCommand,
  //users
  CreateUserUseCase,
  UpdateBanInfoOfUserUseCase,
  DeleteUserUseCase,
  //devices
  DeleteDevicesExcludeCurrentUseCase,
  DeleteDeviceByIdUseCase,
];

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
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
      url: process.env.POSTGRES_URL + '?sslmode=require',
    }),
    JwtModule.register({}),
  ],
  controllers: [
    AuthController,
    BlogsPublicController,
    BlogsBloggerController,
    DevicesController,
    PostsController,
    CommentsController,
    UsersSaController,
    UsersBloggerController,
    TestingController,
  ],
  providers: [
    ...services,
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
