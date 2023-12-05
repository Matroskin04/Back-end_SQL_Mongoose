import { forwardRef, Module } from '@nestjs/common';
import { BlogsPublicController } from './api/blogs-public.controller';
import { BlogsBloggerController } from './api/blogs-blogger.controller';
import { BlogsSAController } from './api/blogs-sa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { Blogs } from './domain/blogs.entity';
import { BannedUsersOfBlog } from './domain/banned-users-of-blog.entity';
import { CreateBlogUseCase } from './application/blogger/use-cases/create-blog.use-case';
import { UpdateBlogUseCase } from './application/blogger/use-cases/update-blog.use-case';
import { DeleteBlogUseCase } from './application/blogger/use-cases/delete-blog.use-case';
import { BindBlogWithUserUseCase } from './application/sa/use-cases/bind-blog-with-user.use-case';
import { UpdateBanInfoOfBlogUseCase } from './application/sa/use-cases/update-ban-info-of-blog.use-case';
import { UploadBlogIconUseCase } from './application/blogger/use-cases/upload-blog-icon.use-case';
import { UploadBlogWallpaperUseCase } from './application/blogger/use-cases/upload-blog-wallpaper.use-case';
import { SubscribeToBlogUseCase } from './application/blogger/use-cases/subsribe-to-blog.use-case';
import { UnsubscribeFromBlogUseCase } from './application/blogger/use-cases/usubsribe-from-blog.use-case';
import { BlogsOrmRepository } from './infrastructure/typeORM/repository/blogs-orm.repository';
import { BlogsRepository } from './infrastructure/SQL/repository/blogs.repository';
import { BlogsOrmQueryRepository } from './infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import { BlogsQueryRepository } from './infrastructure/SQL/query.repository/blogs.query.repository';
import { UsersOrmQueryRepository } from '../users/infrastructure/typeORM/query.repository/users-orm.query.repository';
import { S3StorageAdapter } from '../../infrastructure/adapters/s3-storage.adapter';
import { PhotosForBlogRepository } from './infrastructure/typeORM/subrepositories/photos-for-blog.repository';
import { PhotosForBlogQueryRepository } from './infrastructure/typeORM/query.repository/photos-for-blog.query.repository';
import { SubscriptionsBlogOrmRepository } from './infrastructure/typeORM/subrepositories/subscription-blog-orm.repository';
import { SubscribersOfBlog } from './domain/subscribers-of-blog.entity';
import { IconOfBlog } from './domain/icon-of-blog.entity';
import { WallpaperOfBlog } from './domain/wallpaper-of-blog.entity';
import { UsersModule } from '../users/users.module';
import { PostsOrmQueryRepository } from '../posts/infrastructure/typeORM/query.repository/posts-orm.query.repository';
import { Posts } from '../posts/domain/posts.entity';
import { PostsLikesInfo } from '../posts/domain/posts-likes-info.entity';
import { CommentsOrmQueryRepository } from '../comments/infrastructure/typeORM/query.repository/comments-orm.query.repository';
import { Comments } from '../comments/domain/comments.entity';
import { UsersOrmRepository } from '../users/infrastructure/typeORM/repository/users-orm.repository';
import { PostsModule } from '../posts/posts.module';
import { CommentsModule } from '../comments/comments.module';

const entities = [
  Blogs,
  BannedUsersOfBlog,
  SubscribersOfBlog,
  IconOfBlog,
  WallpaperOfBlog,
];
const queryRepositories = [
  BlogsOrmQueryRepository,
  BlogsQueryRepository,
  PhotosForBlogQueryRepository,
];
const repositories = [
  BlogsOrmRepository,
  BlogsRepository,
  SubscriptionsBlogOrmRepository,
  PhotosForBlogRepository,
];
const useCases = [
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  BindBlogWithUserUseCase,
  UpdateBanInfoOfBlogUseCase,
  UploadBlogIconUseCase,
  UploadBlogWallpaperUseCase,
  SubscribeToBlogUseCase,
  UnsubscribeFromBlogUseCase,
];

@Module({
  imports: [
    TypeOrmModule.forFeature([...entities]),
    CqrsModule,
    forwardRef(() => UsersModule),
    PostsModule,
    CommentsModule,
  ],
  controllers: [
    BlogsPublicController,
    BlogsBloggerController,
    BlogsSAController,
  ],

  providers: [
    ...useCases,
    ...repositories,
    ...queryRepositories,
    S3StorageAdapter,
  ],
  exports: [TypeOrmModule, BlogsOrmQueryRepository],
})
export class BlogsModule {}
