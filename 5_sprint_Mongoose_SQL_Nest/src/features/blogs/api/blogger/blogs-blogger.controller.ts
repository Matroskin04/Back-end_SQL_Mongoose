import {
  QueryBlogsInputModel,
  QueryCommentsOfBlogInputModel,
  QueryPostsOfBlogInputModel,
} from '../models/input/queries-blog.input.model';
import {
  BlogsOutputModel,
  PostsOfBlogViewModel,
  BlogOutputModel,
} from '../models/output/blog.output.models';
import { CreateBlogInputModel } from '../models/input/create-blog.input.model';
import { UpdateBlogInputModel } from '../models/input/update-blog.input.model';

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAccessGuard } from '../../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { HTTP_STATUS_CODE } from '../../../../infrastructure/utils/enums/http-status';
import { PostsQueryRepository } from '../../../posts/infrastructure/SQL/query.repository/posts.query.repository';
import { CurrentUserId } from '../../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { CreatePostByBlogIdModel } from '../../../posts/api/models/input/create-post.input.model';
import { PostTypeWithId } from '../../../posts/infrastructure/SQL/repository/posts.types.repositories';
import { BlogOwnerByIdGuard } from '../../../../infrastructure/guards/blog-owner-by-id.guard';
import { UpdatePostByBlogIdInputModel } from '../models/input/update-post-by-blog-id.input.model';
import { CommentsQueryRepository } from '../../../comments/infrastructure/SQL/query.repository/comments.query.repository';
import { BlogsQueryRepository } from '../../infrastructure/SQL/query.repository/blogs.query.repository';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../../application/blogger/use-cases/create-blog.use-case';
import { UpdateBlogCommand } from '../../application/blogger/use-cases/update-blog.use-case';
import { DeleteBlogCommand } from '../../application/blogger/use-cases/delete-blog.use-case';
import { CreatePostCommand } from '../../../posts/application/use-cases/create-post.use-case';
import { UpdatePostCommand } from '../../../posts/application/use-cases/update-post.use-case';
import { DeletePostCommand } from '../../../posts/application/use-cases/delete-post.use-case';

@Controller('/hometask-nest/blogger/blogs')
export class BlogsBloggerController {
  constructor(
    protected commandBus: CommandBus,
    protected blogsQueryRepository: BlogsQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Get()
  async getAllBlogs(
    @Query() query: QueryBlogsInputModel,
    @CurrentUserId() userId: string,
  ): Promise<BlogsOutputModel> {
    const result = await this.blogsQueryRepository.getAllBlogsOfBlogger(
      query,
      userId.toString(),
    );
    return result;
  }

  @UseGuards(JwtAccessGuard, BlogOwnerByIdGuard)
  @Get(':blogId/posts')
  async getAllPostsOfBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: string,
    @Query() query: QueryPostsOfBlogInputModel,
  ): Promise<PostsOfBlogViewModel> {
    const result = await this.postsQueryRepository.getAllPostsOfBlog(
      blogId,
      query,
      userId,
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessGuard)
  @Get('comments')
  async getCommentsOfBlogger(
    @CurrentUserId() userId: string,
    @Query() query: QueryCommentsOfBlogInputModel,
  ) {
    const result = await this.commentsQueryRepository.getCommentsOfBlogger(
      query,
      userId,
    );
    return result;
  }

  @UseGuards(JwtAccessGuard)
  @HttpCode(HTTP_STATUS_CODE.CREATED_201)
  @Post()
  async createBlog(
    @Body() inputBlogModel: CreateBlogInputModel,
    @CurrentUserId() userId: string,
  ): Promise<BlogOutputModel> {
    const result = await this.commandBus.execute(
      new CreateBlogCommand(inputBlogModel, userId),
    );
    return result;
  }

  @UseGuards(JwtAccessGuard, BlogOwnerByIdGuard)
  @Post(`/:blogId/posts`)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: string,
    @Body() inputPostModel: CreatePostByBlogIdModel,
  ): Promise<PostTypeWithId> {
    const result = await this.commandBus.execute(
      new CreatePostCommand(blogId, userId, inputPostModel),
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessGuard, BlogOwnerByIdGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':blogId')
  async updateBlog(
    @Param('blogId') blogId: string,
    @Body() inputBlogModel: UpdateBlogInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new UpdateBlogCommand(inputBlogModel, blogId),
    );
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(JwtAccessGuard, BlogOwnerByIdGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':blogId/posts/:postId')
  async updatePostOfBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() inputPostModel: UpdatePostByBlogIdInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new UpdatePostCommand(blogId, postId, inputPostModel),
    );

    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(JwtAccessGuard, BlogOwnerByIdGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Delete(':blogId')
  async deleteBlog(@Param('blogId') blogId: string): Promise<void> {
    const result = await this.commandBus.execute(new DeleteBlogCommand(blogId));
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(JwtAccessGuard, BlogOwnerByIdGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Delete(':blogId/posts/:postId')
  async deletePostOfBlog(
    @Param('postId') postId: string,
    @Param('blogId') blogId: string,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new DeletePostCommand(postId, blogId),
    );
    if (!result) throw new NotFoundException();
    return;
  }
}
