import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PostsQueryRepository } from '../../../posts/infrastructure/query.repository/posts.query.repository';
import { JwtAccessNotStrictGuard } from '../../../../infrastructure/guards/authorization-guards/jwt-access-not-strict.guard';
import { CurrentUserId } from '../../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { QueryBlogsInputModel } from '../models/input/queries-blog.input.model';
import { BlogsQueryRepository } from '../../infrastructure/query.repository/blogs.query.repository';
import {
  BlogOutputModel,
  BlogsOutputModel,
  PostsOfBlogViewModel,
} from '../models/output/blog.output.models';

@SkipThrottle()
@Controller('/hometask-nest/blogs')
export class BlogsPublicController {
  constructor(
    protected postsQueryRepository: PostsQueryRepository,
    protected blogsQueryRepository: BlogsQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: QueryBlogsInputModel,
  ): Promise<BlogsOutputModel> {
    const result = await this.blogsQueryRepository.getAllBlogsPublic(query);
    return result;
  }

  @Get(':id')
  async getBlogById(@Param('id') blogId: string): Promise<BlogOutputModel> {
    const result = await this.blogsQueryRepository.getBlogByIdPublic(blogId);
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':blogId/posts')
  async getAllPostsOfBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: string,
    @Query() query: QueryBlogsInputModel,
  ): Promise<PostsOfBlogViewModel> {
    const result = await this.postsQueryRepository.getAllPostsOfBlog(
      blogId,
      query,
      userId,
    );
    if (!result) throw new NotFoundException();
    return result;
  }
}
