//this configModule should be the first import of app
import { configModule } from './configuration/configModule';
import { Module } from '@nestjs/common';
import { LocalStrategy } from './infrastructure/strategy/local.strategy';
import { JwtRefreshStrategy } from './infrastructure/strategy/jwt-refresh.strategy';
import { JwtModule } from '@nestjs/jwt';
import { JwtAccessStrategy } from './infrastructure/strategy/jwt-access.strategy';
import { BasicStrategy } from './infrastructure/strategy/basic.strategy';
import { IsBlogByIdExistsConstraint } from './infrastructure/decorators/posts/blog-id-exists.decorator';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { CqrsModule } from '@nestjs/cqrs';
import { IsUserBannedByJWTStrategy } from './infrastructure/strategy/is-user-banned-by-jwt.strategy';
import { ScheduleModule } from '@nestjs/schedule';
import { PostSubscriber } from './infrastructure/subscribers/post.subscriber';
import { QuizModule } from './features/quiz/quiz.module';
import { UsersModule } from './features/users/users.module';
import { BlogsModule } from './features/blogs/blogs.module';
import { DevicesModule } from './features/devices/devices.module';
import { AuthModule } from './features/auth/auth.module';
import { CommentsModule } from './features/comments/comments.module';
import { PostsModule } from './features/posts/posts.module';
import { TestingModule } from './features/testing/testing.module';
import { IntegrationsModule } from './features/integrations/integrations.module';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './infrastructure/providers/db/database.module';

@Module({
  imports: [
    CqrsModule,
    ThrottlerModule.forRoot(),
    configModule,
    ScheduleModule.forRoot(),
    JwtModule.register({}),
    DatabaseModule,
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
    //constraint
    IsBlogByIdExistsConstraint,

    //Strategies
    LocalStrategy,
    JwtRefreshStrategy,
    JwtAccessStrategy,
    BasicStrategy,
    IsUserBannedByJWTStrategy,

    //subscribers
    PostSubscriber,

    //Throttler
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
