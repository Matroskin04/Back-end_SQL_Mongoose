//this configModule should be the first import of app
import { configModule } from './configuration/configModule';
import { Module } from '@nestjs/common';
import { LocalStrategy } from './infrastructure/strategy/local.strategy';
import { EmailAdapter } from './infrastructure/adapters/email.adapter';
import { JwtRefreshStrategy } from './infrastructure/strategy/jwt-refresh.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './infrastructure/strategy/jwt-access.strategy';
import { BasicStrategy } from './infrastructure/strategy/basic.strategy';
import { IsBlogByIdExistsConstraint } from './infrastructure/decorators/posts/blog-id-exists.decorator';
import { ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordRecoveryPublicRepository } from './features/users/infrastructure/SQL/subrepository/password-recovery.public.repository';
import { BanInfoPublicRepository } from './features/users/infrastructure/SQL/subrepository/ban-info.public.repository';
import { EmailConfirmationPublicRepository } from './features/users/infrastructure/SQL/subrepository/email-confirmation.public.repository';
import { IsUserBannedByJWTStrategy } from './infrastructure/strategy/is-user-banned-by-jwt.strategy';
import { Devices } from './features/devices/domain/devices.entity';
import { UsersOrmQueryRepository } from './features/users/infrastructure/typeORM/query.repository/users-orm.query.repository';
import { DevicesOrmRepository } from './features/devices/infrastructure/typeORM/repository/devices-orm.repository';
import { DevicesOrmQueryRepository } from './features/devices/infrastructure/typeORM/query.repository/devices-orm.query.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ConfigType } from './configuration/configuration';
import { SubscribersOfTgBotRepository } from './features/integrations/infrastructure/repository/subscribers-of-tg-bot.repository';
import { TelegramAdapter } from './infrastructure/adapters/telegram.adapter';
import { PostSubscriber } from './infrastructure/subscribers/post.subscriber';
import { QuizModule } from './features/quiz/quiz.module';
import { UsersModule } from './features/users/users.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { BlogsQueryRepository } from './features/blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { BlogsOrmQueryRepository } from './features/blogs/infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import { DevicesModule } from './features/devices/devices.module';
import { AuthModule } from './features/auth/auth.module';
import { CommentsModule } from './features/comments/comments.module';
import { PostsModule } from './features/posts/posts.module';
import { TestingModule } from './features/testing/testing.module';
import { IntegrationsModule } from './features/integrations/integrations.module';

const queryRepositories = [
  // SQL
  BlogsQueryRepository,
  //ORM
  BlogsOrmQueryRepository,
  DevicesOrmQueryRepository,
  UsersOrmQueryRepository,
  SubscribersOfTgBotRepository,
];
const repositories = [
  //SQL
  PasswordRecoveryPublicRepository,
  BanInfoPublicRepository,
  EmailConfirmationPublicRepository,
  //ORM
  DevicesOrmRepository,
];

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot(),
    configModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Devices]),
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
        // ssl: { require: true, rejectUnauthorized: false },
        // url: process.env.POSTGRES_URL + '?sslmode=require',
      }),
    }),
    JwtModule.register({}),
    AuthModule,
    BlogsModule,
    QuizModule,
    UsersModule,
    DevicesModule,
    CommentsModule,
    PostsModule,
    TestingModule,
    IntegrationsModule,
  ],
  providers: [
    ...queryRepositories,
    ...repositories,
    IsBlogByIdExistsConstraint,
    //Strategies
    LocalStrategy,
    JwtRefreshStrategy,
    JwtAccessStrategy,
    BasicStrategy,
    IsUserBannedByJWTStrategy,

    //Managers && Adapters
    EmailAdapter,
    TelegramAdapter,
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
