import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PostsQueryRepository } from '../../../posts/infrastructure/query.repository/posts.query.repository';
import { HTTP_STATUS_CODE } from '../../../../infrastructure/utils/enums/http-status';
import {
  JwtAccessNotStrictGuard,
  JwtAccessNotStrictGuardMongo,
} from '../../../../infrastructure/guards/authorization-guards/jwt-access-not-strict.guard';
import {
  CurrentUserId,
  CurrentUserIdMongo,
} from '../../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { ObjectId } from 'mongodb';
import { Response } from 'express';
import { QueryBlogInputModel } from '../../blogger-blogs/api/models/input/query-blog.input.model';
import {
  BlogOutputModel,
  BlogOutputModelMongo,
  ViewAllBlogsModel,
  ViewPostsOfBlogModel,
} from '../../blogger-blogs/api/models/output/blog.output.model';
import { BlogsPublicQueryRepository } from '../infrastructure/query.repository/blogs-public.query.repository';

@SkipThrottle()
@Controller('/hometask-nest/blogs')
export class BlogsPublicController {
  constructor(
    protected postsQueryRepository: PostsQueryRepository,
    protected blogsPublicQueryRepository: BlogsPublicQueryRepository,
  ) {}

  @Get()
  async getAllBlogs(
    @Query() query: QueryBlogInputModel,
  ): Promise<ViewAllBlogsModel> {
    const result = await this.blogsPublicQueryRepository.getAllBlogs(query);
    return result;
  }

  @Get(':id')
  async getBlogById(@Param('id') blogId: string): Promise<BlogOutputModel> {
    const result = await this.blogsPublicQueryRepository.getBlogById(blogId);
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':blogId/posts')
  async getAllPostsOfBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: string,
    @Query() query: QueryBlogInputModel,
  ): Promise<ViewPostsOfBlogModel> {
    const result = await this.postsQueryRepository.getAllPostsOfBlog(
      blogId,
      query,
      userId,
    );
    if (!result) throw new NotFoundException();
    return result;
  }
}
