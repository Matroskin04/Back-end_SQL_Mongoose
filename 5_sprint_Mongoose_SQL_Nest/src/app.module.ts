import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import {
  LikesInfo,
  LikesInfoSchema,
  Post,
  PostSchema,
} from './features/posts/domain/posts.entity';
import {
  Comment,
  CommentatorInfo,
  CommentatorInfoSchema,
  CommentsSchema,
} from './features/comments/domain/comments.entity';
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
import { AuthService } from './features/auth/application/auth.service';
import { CryptoAdapter } from './infrastructure/adapters/crypto.adapter';
import { EmailManager } from './infrastructure/managers/email-manager';
import { EmailAdapter } from './infrastructure/adapters/email.adapter';
import { AuthController } from './features/auth/api/auth.controller';
import { JwtRefreshStrategy } from './infrastructure/strategy/jwt-refresh.strategy';
import { JwtModule } from '@nestjs/jwt';
import {
  JwtAccessStrategy,
  JwtAccessStrategyMongo,
} from './infrastructure/strategy/jwt-access.strategy';
import { BasicStrategy } from './infrastructure/strategy/basic.strategy';
import {
  CommentLikesInfo,
  CommentsLikesInfoSchema,
  PostLikesInfo,
  PostsLikesInfoSchema,
} from './features/likes-info/domain/likes-info.entity';
import { LikesInfoService } from './features/likes-info/application/likes-info.service';
import { LikesInfoQueryRepository } from './features/likes-info/infrastructure/query.repository/likes-info.query.repository';
import { LikesInfoRepository } from './features/likes-info/infrastructure/repository/likes-info.repository';
import { CommentsService } from './features/comments/application/comments.service';
import { CommentsRepository } from './features/comments/infrastructure/repository/comments.repository';
import { IsBlogByIdExistsConstraint } from './infrastructure/decorators/posts/blog-id-exists.decorator';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { DevicesController } from './features/devices/api/devices.controller';
import { DevicesService } from './features/devices/application/devices.service';
import { DevicesQueryRepository } from './features/devices/infrastructure/query.repository/devices.query.repository';
import { DevicesRepository } from './features/devices/infrastructure/repository/devices.repository';
import { JwtService } from './features/jwt/jwt.service';
import { BlogsPublicController } from './features/blogs/api/public/blogs-public.controller';
import { BlogsBloggerController } from './features/blogs/api/blogger/blogs-blogger.controller';
import { BlogsSAController } from './features/blogs/api/sa/blogs-sa.controller';
import { BlogsBloggerService } from './features/blogs/application/blogger/blogs-blogger.service';
import { BlogsSAService } from './features/blogs/application/sa/blogs-sa.service';
import { BlogsQueryRepository } from './features/blogs/infrastructure/query.repository/blogs.query.repository';
import { BlogsRepository } from './features/blogs/infrastructure/repository/blogs.repository';
import { UsersBloggerService } from './features/users/application/blogger/users-blogger.service';
import { UsersBloggerController } from './features/users/api/blogger/users-blogger.controller';
import { BannedUsersByBloggerQueryRepository } from './features/users/banned/banned-by-blogger-users/infrastructure/banned-users-by-blogger-query.repository';
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
import { User, UserSchema } from './features/users/domain/users.entity';
import {
  BannedUsersByBlogger,
  BannedUsersByBloggerSchema,
} from './features/users/banned/banned-by-blogger-users/domain/users-banned-by-blogger.entity';
import { CommentsLikesRepository } from './features/comments/infrastructure/subrepository/comments-likes.repository';

const services = [
  AuthService,
  BlogsBloggerService,
  CommentsService,
  BlogsSAService,
  DevicesService,
  LikesInfoService,
  JwtService,
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
  BannedUsersByBloggerQueryRepository,
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
  SendEmailPassRecoveryUseCase,
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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: 5432,
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DATABASE,
      autoLoadEntities: false,
      synchronize: false,
      url: process.env.POSTGRES_URL + '?sslmode=require',
    }),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Post.name, schema: PostSchema },
      { name: BannedUsersByBlogger.name, schema: BannedUsersByBloggerSchema },
      { name: LikesInfo.name, schema: LikesInfoSchema },
      { name: PostLikesInfo.name, schema: PostsLikesInfoSchema },
      { name: Comment.name, schema: CommentsSchema },
      { name: CommentatorInfo.name, schema: CommentatorInfoSchema },
      { name: CommentLikesInfo.name, schema: CommentsLikesInfoSchema },
    ]),
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
    ...services,
    ...queryRepositories,
    ...repositories,
    IsBlogByIdExistsConstraint,
    //Strategy
    LocalStrategy,
    JwtRefreshStrategy,
    JwtAccessStrategy,
    JwtAccessStrategyMongo,
    BasicStrategy,

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
