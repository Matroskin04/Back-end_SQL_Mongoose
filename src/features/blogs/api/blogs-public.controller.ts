import {
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAccessNotStrictGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access-not-strict.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/current-user-id.param.decorator';
import { QueryBlogsInputModel } from './models/input/queries-blog.input.model';
import {
  BlogOutputModel,
  BlogsOutputModel,
  PostsOfBlogViewModel,
} from './models/output/blog.output.models';
import { QueryPostInputModel } from '../../posts/api/models/input/query-post.input.model';
import { BlogsOrmQueryRepository } from '../infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import { PostsOrmQueryRepository } from '../../posts/infrastructure/typeORM/query.repository/posts-orm.query.repository';
import { JwtAccessGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { CommandBus } from '@nestjs/cqrs';
import { SubscribeToBlogCommand } from '../application/blogger/use-cases/subsribe-to-blog.use-case';
import { UnsubscribeFromBlogCommand } from '../application/blogger/use-cases/usubsribe-from-blog.use-case';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';

@Controller('/api/blogs')
export class BlogsPublicController {
  constructor(
    protected postsOrmQueryRepository: PostsOrmQueryRepository,
    protected blogsOrmQueryRepository: BlogsOrmQueryRepository,
    protected commandBus: CommandBus,
  ) {}

  @UseGuards(JwtAccessNotStrictGuard)
  @Get()
  async getAllBlogs(
    @CurrentUserId() userId: string | null,
    @Query() query: QueryBlogsInputModel,
  ): Promise<BlogsOutputModel> {
    const result = await this.blogsOrmQueryRepository.getAllBlogsPublic(
      query,
      userId,
    );
    return result;
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':id')
  async getBlogById(
    @CurrentUserId() userId: string | null,
    @Param('id') blogId: string,
  ): Promise<BlogOutputModel> {
    const result = await this.blogsOrmQueryRepository.getBlogByIdPublic(
      blogId,
      userId,
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':blogId/posts')
  async getAllPostsOfBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: string | null,
    @Query() query: QueryPostInputModel,
  ): Promise<PostsOfBlogViewModel> {
    const result = await this.postsOrmQueryRepository.getAllPostsOfBlog(
      blogId,
      query,
      userId,
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Post(':blogId/subscription')
  async subscribeToBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new SubscribeToBlogCommand(blogId, userId),
    );
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(JwtAccessGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Delete(':blogId/subscription')
  async unsubscribeFromBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new UnsubscribeFromBlogCommand(blogId, userId),
    );
    if (!result) throw new NotFoundException();
    return;
  }
}
