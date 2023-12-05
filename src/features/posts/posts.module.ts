import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { PostsQueryRepository } from './infrastructure/SQL/query.repository/posts.query.repository';
import { LikesInfoQueryRepository } from '../likes-info/infrastructure/SQL/query.repository/likes-info.query.repository';
import { LikesInfoOrmQueryRepository } from '../likes-info/infrastructure/typeORM/query.repository/likes-info-orm.query.repository';
import { PostsOrmQueryRepository } from './infrastructure/typeORM/query.repository/posts-orm.query.repository';
import { PhotosForPostQueryRepository } from './infrastructure/typeORM/query.repository/photos-for-post.query.repository';
import { LikesInfoRepository } from '../likes-info/infrastructure/SQL/repository/likes-info.repository';
import { PostsRepository } from './infrastructure/SQL/repository/posts.repository';
import { PostsOrmRepository } from './infrastructure/typeORM/repository/posts-orm.repository';
import { LikesInfoOrmRepository } from '../likes-info/infrastructure/typeORM/repository/likes-info-orm.repository';
import { PhotosForPostRepository } from './infrastructure/typeORM/repository/photos-for-post.repository';
import { CreatePostUseCase } from './application/use-cases/create-post.use-case';
import { UpdatePostUseCase } from './application/use-cases/update-post.use-case';
import { UpdatePostLikeStatusUseCase } from './application/use-cases/update-post-like-status.use-case';
import { DeletePostUseCase } from './application/use-cases/delete-post.use-case';
import { UploadPostMainImgUseCase } from './application/use-cases/upload-post-main-img.use-case';
import { Posts } from './domain/posts.entity';
import { PostsLikesInfo } from './domain/posts-likes-info.entity';
import { IconOfPost } from './domain/main-img-of-post.entity';
import { SubscribersOfTgBot } from '../integrations/domain/subscribers-of-tg-bot.entity';
import { PostsController } from './api/posts.controller';
import { S3StorageAdapter } from '../../infrastructure/adapters/s3-storage.adapter';
import { UsersModule } from '../users/users.module';
import { BlogsModule } from '../blogs/blogs.module';
import { CommentsModule } from '../comments/comments.module';

const entities = [Posts, PostsLikesInfo, IconOfPost, SubscribersOfTgBot];

const queryRepositories = [
  PostsQueryRepository,
  LikesInfoQueryRepository,
  LikesInfoOrmQueryRepository,
  PostsOrmQueryRepository,
  PhotosForPostQueryRepository,
];

const repositories = [
  LikesInfoRepository,
  PostsRepository,
  PostsOrmRepository,
  LikesInfoOrmRepository,
  PhotosForPostRepository,
];
const useCases = [
  CreatePostUseCase,
  UpdatePostUseCase,
  UpdatePostLikeStatusUseCase,
  DeletePostUseCase,
  UploadPostMainImgUseCase,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([...entities]),
    CqrsModule,
    forwardRef(() => UsersModule),
    forwardRef(() => BlogsModule),
    CommentsModule,
  ],
  controllers: [PostsController],
  providers: [
    ...queryRepositories,
    ...repositories,
    ...useCases,
    S3StorageAdapter,
  ],
  exports: [TypeOrmModule, PostsOrmQueryRepository],
})
export class PostsModule {}
