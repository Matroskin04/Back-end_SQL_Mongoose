import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { QuizSaController } from '../quiz/api/quiz-sa.controller';
import { QuizPublicController } from '../quiz/api/quiz-public.controller';
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
import { BlogsQueryRepository } from '../blogs/infrastructure/SQL/query.repository/blogs.query.repository';
import { CommentsLikesInfo } from '../comments/domain/comments-likes-info.entity';
import { BlogsOrmQueryRepository } from '../blogs/infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import { Blogs } from '../blogs/domain/blogs.entity';
import { BannedUsersOfBlog } from '../blogs/domain/banned-users-of-blog.entity';
import { S3StorageAdapter } from '../../infrastructure/adapters/s3-storage.adapter';
import { CommentsOrmQueryRepository } from '../comments/infrastructure/typeORM/query.repository/comments-orm.query.repository';
import { Comments } from '../comments/domain/comments.entity';

const entities = [
  Posts,
  PostsLikesInfo,
  IconOfPost,
  SubscribersOfTgBot,
  CommentsLikesInfo,
  Blogs,
  BannedUsersOfBlog,
  Comments,
];

const queryRepositories = [
  PostsQueryRepository,
  LikesInfoQueryRepository,
  LikesInfoOrmQueryRepository,
  PostsOrmQueryRepository,
  PhotosForPostQueryRepository,
  BlogsQueryRepository,
  BlogsOrmQueryRepository,
  CommentsOrmQueryRepository,
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
  imports: [TypeOrmModule.forFeature([...entities]), CqrsModule],
  controllers: [PostsController],
  providers: [
    ...queryRepositories,
    ...repositories,
    ...useCases,
    S3StorageAdapter,
  ],
  exports: [TypeOrmModule],
})
export class PostsModule {}
