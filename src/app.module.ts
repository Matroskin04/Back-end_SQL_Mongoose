//this configModule should be the first import of app
import { configModule } from './configuration/configModule';
import { Module } from '@nestjs/common';
import { PostsController } from './features/posts/api/posts.controller';
import { PostsQueryRepository } from './features/posts/infrastructure/SQL/query.repository/posts.query.repository';
import { PostsRepository } from './features/posts/infrastructure/SQL/repository/posts.repository';
import { CommentsController } from './features/comments/api/comments.controller';
import { CommentsQueryRepository } from './features/comments/infrastructure/SQL/query.repository/comments.query.repository';
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
import { LikesInfoQueryRepository } from './features/likes-info/infrastructure/SQL/query.repository/likes-info.query.repository';
import { LikesInfoRepository } from './features/likes-info/infrastructure/SQL/repository/likes-info.repository';
import { CommentsRepository } from './features/comments/infrastructure/SQL/repository/comments.repository';
import { IsBlogByIdExistsConstraint } from './infrastructure/decorators/posts/blog-id-exists.decorator';
import { ThrottlerModule } from '@nestjs/throttler';
import { DevicesController } from './features/devices/api/devices.controller';
import { DevicesQueryRepository } from './features/devices/infrastructure/SQL/query.repository/devices.query.repository';
import { DevicesRepository } from './features/devices/infrastructure/SQL/repository/devices.repository';
import { JwtAdapter } from './infrastructure/adapters/jwt.adapter';
import { RegisterUserUseCase } from './features/auth/application/use-cases/register-user.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfirmEmailUseCase } from './features/auth/application/use-cases/confirm-email.use-case';
import { ResendConfirmationEmailMessageUseCase } from './features/auth/application/use-cases/resend-confirmation-email-message.use-case';
import { UpdatePasswordUseCase } from './features/auth/application/use-cases/update-password-use.case';
import { LoginUserUseCase } from './features/auth/application/use-cases/login-user.use-case';
import { SendEmailPassRecoveryUseCase } from './features/auth/application/use-cases/send-email-pass-recovery.use-case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordRecoveryPublicRepository } from './features/users/infrastructure/SQL/subrepository/password-recovery.public.repository';
import { BanInfoPublicRepository } from './features/users/infrastructure/SQL/subrepository/ban-info.public.repository';
import { EmailConfirmationPublicRepository } from './features/users/infrastructure/SQL/subrepository/email-confirmation.public.repository';
import { DeleteDevicesExcludeCurrentUseCase } from './features/devices/application/use-cases/delete-devices-exclude-current.use-case';
import { DeleteDeviceByIdUseCase } from './features/devices/application/use-cases/delete-device-by-id.use-case';
import { CommentsLikesRepository } from './features/comments/infrastructure/SQL/subrepository/comments-likes.repository';
import { IsUserBannedByJWTStrategy } from './infrastructure/strategy/is-user-banned-by-jwt.strategy';
import { Posts } from './features/posts/domain/posts.entity';
import { Comments } from './features/comments/domain/comments.entity';
import { PostsLikesInfo } from './features/posts/domain/posts-likes-info.entity';
import { CommentsLikesInfo } from './features/comments/domain/comments-likes-info.entity';
import { Devices } from './features/devices/domain/devices.entity';
import { ValidateUserUseCase } from './features/auth/application/use-cases/validate-user.use-case';
import { UpdateCommentUseCase } from './features/comments/application/use-cases/update-comment.use-case';
import { DeleteCommentUseCase } from './features/comments/application/use-cases/delete-comment.use-case';
import { CreateCommentUseCase } from './features/comments/application/use-cases/create-comment-by-post-id.use-case';
import { UpdateCommentLikeStatusUseCase } from './features/comments/application/use-cases/update-comment-like-status.use-case';
import { CreatePostUseCase } from './features/posts/application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from './features/posts/application/use-cases/update-post.use-case';
import { UpdatePostLikeStatusUseCase } from './features/posts/application/use-cases/update-post-like-status.use-case';
import { DeletePostUseCase } from './features/posts/application/use-cases/delete-post.use-case';
import { DeleteDevicesByUserIdUseCase } from './features/devices/application/use-cases/delete-devices-by-user-id.use.case';
import { CreateDeviceUseCase } from './features/devices/application/use-cases/create-device.use-case';
import { DeleteDeviceByRefreshTokenUseCase } from './features/devices/application/use-cases/delete-device-by-refresh-token.use-case';
import { UsersOrmQueryRepository } from './features/users/infrastructure/typeORM/query.repository/users-orm.query.repository';
import { DevicesOrmRepository } from './features/devices/infrastructure/typeORM/repository/devices-orm.repository';
import { UsersOrmRepository } from './features/users/infrastructure/typeORM/repository/users-orm.repository';
import { EmailConfirmationOrmRepository } from './features/users/infrastructure/typeORM/subrepository/email-confirmation-orm.public.repository';
import { PasswordRecoveryOrmRepository } from './features/users/infrastructure/typeORM/subrepository/password-recovery-orm.public.repository';
import { BanInfoOrmRepository } from './features/users/infrastructure/typeORM/subrepository/ban-info-orm.public.repository';
import { PostsOrmQueryRepository } from './features/posts/infrastructure/typeORM/query.repository/posts-orm.query.repository';
import { PostsOrmRepository } from './features/posts/infrastructure/typeORM/repository/posts-orm.repository';
import { LikesInfoOrmRepository } from './features/likes-info/infrastructure/typeORM/repository/likes-info-orm.repository';
import { LikesInfoOrmQueryRepository } from './features/likes-info/infrastructure/typeORM/query.repository/likes-info-orm.query.repository';
import { CommentsOrmRepository } from './features/comments/infrastructure/typeORM/repository/comments-orm.repository';
import { CommentsOrmQueryRepository } from './features/comments/infrastructure/typeORM/query.repository/comments-orm.query.repository';
import { CommentsLikesOrmRepository } from './features/comments/infrastructure/typeORM/subrepository/comments-likes-orm.repository';
import { DevicesOrmQueryRepository } from './features/devices/infrastructure/typeORM/query.repository/devices-orm.query.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { S3StorageAdapter } from './infrastructure/adapters/s3-storage.adapter';
import { ConfigType } from './configuration/configuration';
import { IconOfBlog } from './features/blogs/domain/icon-of-blog.entity';
import { PhotosForBlogRepository } from './features/blogs/infrastructure/typeORM/subrepositories/photos-for-blog.repository';
import { WallpaperOfBlog } from './features/blogs/domain/wallpaper-of-blog.entity';
import { PhotosForBlogQueryRepository } from './features/blogs/infrastructure/typeORM/query.repository/photos-for-blog.query.repository';
import { PhotosForPostQueryRepository } from './features/posts/infrastructure/typeORM/query.repository/photos-for-post.query.repository';
import { PhotosForPostRepository } from './features/posts/infrastructure/typeORM/repository/photos-for-post.repository';
import { IconOfPost } from './features/posts/domain/main-img-of-post.entity';
import { SubscribersOfBlog } from './features/blogs/domain/subscribers-of-blog.entity';
import { SubscriptionsBlogOrmRepository } from './features/blogs/infrastructure/typeORM/subrepositories/subscription-blog-orm.repository';
import { TelegramController } from './features/integrations/api/telegram.controller';
import { SubscribersOfTgBot } from './features/integrations/domain/subscribers-of-tg-bot.entity';
import { SubscribersOfTgBotRepository } from './features/integrations/infrastructure/repository/subscribers-of-tg-bot.repository';
import { TelegramAdapter } from './infrastructure/adapters/telegram.adapter';
import { HandleTelegramUpdatesUseCase } from './features/integrations/application/use-cases/handle-telegram-updates.use-case';
import { StartUseCase } from './features/integrations/application/use-cases/sub-use-cases/start.use-case';
import { PostSubscriber } from './infrastructure/subscribers/post.subscriber';
import { QuizModule } from './features/quiz/quiz.module';
import { UsersModule } from './features/users/users.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { UploadPostMainImgUseCase } from './features/posts/application/use-cases/upload-post-main-img.use-case';
import { BlogsQueryRepository } from './features/blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { BlogsOrmQueryRepository } from './features/blogs/infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import { DevicesModule } from './features/devices/devices.module';
import { AuthModule } from './features/auth/auth.module';
import { CommentsModule } from './features/comments/comments.module';
import { PostsModule } from './features/posts/posts.module';
import { TestingModule } from './features/testing/testing.module';

const queryRepositories = [
  // SQL
  BlogsQueryRepository,
  // PostsQueryRepository,
  // LikesInfoQueryRepository,
  // CommentsQueryRepository,

  //ORM
  BlogsOrmQueryRepository,
  // PostsOrmQueryRepository,
  // CommentsOrmQueryRepository,
  DevicesOrmQueryRepository,
  UsersOrmQueryRepository,
  // LikesInfoOrmQueryRepository,
  // PhotosForPostQueryRepository,
  SubscribersOfTgBotRepository,
];
const repositories = [
  //SQL
  PasswordRecoveryPublicRepository,
  BanInfoPublicRepository,
  EmailConfirmationPublicRepository,
  // CommentsRepository,
  // CommentsLikesRepository,
  // LikesInfoRepository,
  // PostsRepository,
  // TestingRepository,

  //ORM
  // PostsOrmRepository,
  // CommentsOrmRepository,
  DevicesOrmRepository,
  // LikesInfoOrmRepository,
  // CommentsLikesOrmRepository,
  // PhotosForPostRepository,
];

const handlers = [
  // UploadPostMainImgUseCase,
  //posts
  // CreatePostUseCase,
  // UpdatePostUseCase,
  // UpdatePostLikeStatusUseCase,
  // DeletePostUseCase,
  //comments
  // CreateCommentUseCase,
  // UpdateCommentUseCase,
  // UpdateCommentLikeStatusUseCase,
  // DeleteCommentUseCase,
  //Telegram
  HandleTelegramUpdatesUseCase,
  StartUseCase,
];

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot(),
    configModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      // Blogs,
      // BannedUsersOfBlog,
      Devices,
      // Posts,
      // PostsLikesInfo,
      // Comments,
      // CommentsLikesInfo,
      // IconOfPost,
      // SubscribersOfTgBot,
    ]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<ConfigType>) => ({
        type: 'postgres',
        host: configService.get('db').postgresql.POSTGRES_HOST,
        port: 5432,
        username: configService.get('db').postgresql.POSTGRES_USER,
        password: configService.get('db').postgresql.POSTGRES_PASSWORD,
        database: configService.get('db').postgresql.POSTGRES_DATABASE,
        autoLoadEntities: true,
        synchronize: false,
        ssl: { require: true, rejectUnauthorized: false },
        // url: process.env.POSTGRES_URL + '?sslmode=require',
      }),
    }),
    JwtModule.register({}),
    BlogsModule,
    QuizModule,
    UsersModule,
    DevicesModule,
    AuthModule,
    CommentsModule,
    PostsModule,
    TestingModule,
  ],
  controllers: [
    // PostsController,
    // CommentsController,
    // TestingController,
    TelegramController,
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
    // EmailManager,
    // CryptoAdapter,
    EmailAdapter,
    // JwtAdapter,
    S3StorageAdapter,
    TelegramAdapter,
    //handlers
    ...handlers,
    //subscribers
    PostSubscriber,

    //Throttler
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
  // exports: [  ],
})
export class AppModule {}
