import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Blog, BlogSchema } from './features/blogs/domain/blogs.entity';
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
import { UsersSaController } from './features/users/super-admin/api/users-sa.controller';
import { CommentsQueryRepository } from './features/comments/infrastructure/query.repository/comments.query.repository';
import { UsersSaService } from './features/users/super-admin/application/users-sa.service';
import { UsersSARepository } from './features/users/super-admin/infrastructure/repository/users-sa.repository';
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
import { JwtAccessStrategy } from './infrastructure/strategy/jwt-access.strategy';
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
import { APP_GUARD } from '@nestjs/core';
import { DevicesController } from './features/devices/api/devices.controller';
import { DevicesService } from './features/devices/application/devices.service';
import { DevicesQueryRepository } from './features/devices/infrastructure/query.repository/devices.query.repository';
import { DevicesRepository } from './features/devices/infrastructure/repository/devices.repository';
import { Device, DeviceSchema } from './features/devices/domain/devices.entity';
import { JwtQueryRepository } from './features/jwt/jwt.query.repository';
import { JwtService } from './features/jwt/jwt.service';
import { BlogsPublicController } from './features/blogs/public-blogs/api/blogs-public.controller';
import { BlogsBloggerController } from './features/blogs/blogger-blogs/api/blogs-blogger.controller';
import { BlogsSAController } from './features/blogs/super-admin-blogs/api/blogs-sa.controller';
import { BlogsBloggerService } from './features/blogs/blogger-blogs/application/blogs-blogger.service';
import { BlogsSAService } from './features/blogs/super-admin-blogs/application/blogs-sa.service';
import { BlogsPublicQueryRepository } from './features/blogs/public-blogs/infrastructure/query.repository/blogs-public.query.repository';
import { BlogsBloggerQueryRepository } from './features/blogs/blogger-blogs/infrastructure/query.repository/blogs-blogger.query.repository';
import { BlogsSAQueryRepository } from './features/blogs/super-admin-blogs/infrastructure/query.repository/blogs-sa.query.repository';
import { BlogsBloggerRepository } from './features/blogs/blogger-blogs/infrastructure/repository/blogs-blogger.repository';
import { BlogsSARepository } from './features/blogs/super-admin-blogs/infrastructure/repository/blogs-sa.repository';
import {
  BannedUserBySA,
  BannedUserBySASchema,
} from './features/users/banned/banned-sa-users/domain/users-banned.entity';
import { BannedUsersQueryRepository } from './features/users/banned/banned-sa-users/infrastructure/banned-users.query.repository';
import { BannedUsersRepository } from './features/users/banned/banned-sa-users/infrastructure/banned-users.repository';
import { UsersBloggerRepository } from './features/users/blogger/infrastructure/repository/users-blogger.repository';
import { UsersBloggerService } from './features/users/blogger/application/users-blogger.service';
import { UsersBloggerController } from './features/users/blogger/api/users-blogger.controller';
import {
  BannedUsersByBlogger,
  BannedUsersByBloggerSchema,
} from './features/users/banned/banned-by-blogger-users/domain/users-banned-by-blogger.entity';
import { BannedUsersByBloggerQueryRepository } from './features/users/banned/banned-by-blogger-users/infrastructure/banned-users-by-blogger-query.repository';
import { UsersBloggerQueryRepository } from './features/users/blogger/infrastructure/query.repository/users-blogger.query.repository';
import { RegisterUserUseCase } from './features/auth/application/use-cases/register-user.use-case';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfirmEmailUseCase } from './features/auth/application/use-cases/confirm-email.use-case';
import { ResendConfirmationEmailMessageUseCase } from './features/auth/application/use-cases/resend-confirmation-email-message.use-case';
import { UsersPublicQueryRepository } from './features/users/public/infrastructure/query.repository/users-public.query.repository';
import { UsersPublicRepository } from './features/users/public/infrastructure/repository/users-public.repository';
import { SaveNewPassUseCase } from './features/auth/application/use-cases/save-new-pass.use-case';
import { LoginUserUseCase } from './features/auth/application/use-cases/login-user.use-case';
import process from 'process';
import { UsersSAQueryRepository } from './features/users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { User, User2Schema } from './features/users/domain/users.entity';
import {
  BanInfo,
  BanInfoSchema,
  EmailConfirmation,
  EmailConfirmationSchema,
  PasswordRecovery,
  PasswordRecoverySchema,
} from './features/users/domain/users.subschemas';
import { SendEmailPassRecoveryUseCase } from './features/auth/application/use-cases/send-email-pass-recovery.use-case';

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
  BlogsPublicQueryRepository,
  BlogsBloggerQueryRepository,
  BlogsSAQueryRepository,
  PostsQueryRepository,
  LikesInfoQueryRepository,
  UsersPublicQueryRepository,
  DevicesQueryRepository,
  CommentsQueryRepository,
  BannedUsersQueryRepository,
  BannedUsersByBloggerQueryRepository,
  JwtQueryRepository,
  UsersSAQueryRepository,
  UsersBloggerQueryRepository,
];
const repositories = [
  BlogsBloggerRepository,
  BlogsSARepository,
  CommentsRepository,
  DevicesRepository,
  LikesInfoRepository,
  PostsRepository,
  UsersBloggerRepository,
  UsersPublicRepository,
  BannedUsersRepository,
  UsersSARepository,
  TestingRepository,
];
const handlers = [
  RegisterUserUseCase,
  ConfirmEmailUseCase,
  ResendConfirmationEmailMessageUseCase,
  SaveNewPassUseCase,
  LoginUserUseCase,
  SendEmailPassRecoveryUseCase,
];

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot({
      ttl: 10,
      limit: 5,
    }),
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URL!),
    MongooseModule.forFeature([
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: LikesInfo.name, schema: LikesInfoSchema },
      { name: Comment.name, schema: CommentsSchema },
      { name: CommentatorInfo.name, schema: CommentatorInfoSchema },
      { name: CommentLikesInfo.name, schema: CommentsLikesInfoSchema },
      { name: PostLikesInfo.name, schema: PostsLikesInfoSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: BannedUserBySA.name, schema: BannedUserBySASchema },
      { name: BannedUsersByBlogger.name, schema: BannedUsersByBloggerSchema },
      { name: User.name, schema: User2Schema },
      { name: EmailConfirmation.name, schema: EmailConfirmationSchema },
      { name: BanInfo.name, schema: BanInfoSchema },
      { name: PasswordRecovery.name, schema: PasswordRecoverySchema },
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
    BasicStrategy,

    //Managers && Adapters
    EmailManager,
    CryptoAdapter,
    EmailAdapter,

    //handlers
    ...handlers,

    //Throttler
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
