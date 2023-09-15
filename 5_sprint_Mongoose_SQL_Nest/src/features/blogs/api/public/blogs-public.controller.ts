import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostsQueryRepository } from '../../../posts/infrastructure/SQL/query.repository/posts.query.repository';
import { JwtAccessNotStrictGuard } from '../../../../infrastructure/guards/authorization-guards/jwt-access-not-strict.guard';
import { CurrentUserId } from '../../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { QueryBlogsInputModel } from '../models/input/queries-blog.input.model';
import { BlogsQueryRepository } from '../../infrastructure/SQL/query.repository/blogs.query.repository';
import {
  BlogOutputModel,
  BlogsOutputModel,
  PostsOfBlogViewModel,
} from '../models/output/blog.output.models';
import { QueryPostInputModel } from '../../../posts/api/models/input/query-post.input.model';
import { BlogsOrmQueryRepository } from '../../infrastructure/typeORM/query.repository/blogs-orm.query.repository';
import { PostsOrmQueryRepository } from '../../../posts/infrastructure/typeORM/query.repository/posts-orm.query.repository';

@Controller('/hometask-nest/blogs')
export class BlogsPublicController {
  constructor(
    protected postsOrmQueryRepository: PostsOrmQueryRepository,
    protected blogsOrmQueryRepository: BlogsOrmQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: QueryBlogsInputModel,
  ): Promise<BlogsOutputModel> {
    const result = await this.blogsOrmQueryRepository.getAllBlogsPublic(query);
    return result;
  }

  @Get(':id')
  async getBlogById(@Param('id') blogId: string): Promise<BlogOutputModel> {
    const result = await this.blogsOrmQueryRepository.getBlogByIdPublic(blogId);
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':blogId/posts')
  async getAllPostsOfBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: string,
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
}
