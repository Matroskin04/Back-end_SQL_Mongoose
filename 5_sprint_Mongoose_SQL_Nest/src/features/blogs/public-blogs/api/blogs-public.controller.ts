import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { PostsQueryRepository } from '../../../posts/infrastructure/query.repository/posts.query.repository';
import { HTTP_STATUS_CODE } from '../../../../infrastructure/utils/enums/http-status';
import { JwtAccessNotStrictGuard } from '../../../../infrastructure/guards/authorization-guards/jwt-access-not-strict.guard';
import { CurrentUserId } from '../../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { ObjectId } from 'mongodb';
import { Response } from 'express';
import { QueryBlogInputModel } from '../../blogger-blogs/api/models/input/query-blog.input.model';
import {
  BlogOutputModel,
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
    @Res() res: Response<ViewAllBlogsModel>,
  ) {
    const result = await this.blogsPublicQueryRepository.getAllBlogs(query);
    res.status(HTTP_STATUS_CODE.OK_200).send(result);
  }

  @Get(':id')
  async getBlogById(
    @Param('id') blogId: string,
    @Res() res: Response<BlogOutputModel>,
  ) {
    const result = await this.blogsPublicQueryRepository.getBlogById(blogId);
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':blogId/posts')
  async getAllPostsOfBlog(
    @Param('blogId') blogId: string,
    @CurrentUserId() userId: ObjectId,
    @Query() query: QueryBlogInputModel,
    @Res() res: Response<ViewPostsOfBlogModel>,
  ) {
    const result = await this.postsQueryRepository.getPostsOfBlog(
      blogId,
      query,
      userId,
    );
    result
      ? res.status(HTTP_STATUS_CODE.OK_200).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }
}
