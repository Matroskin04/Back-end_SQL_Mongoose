import { QueryBlogInputModel } from './models/input/query-blog.input.model';
import {
  ViewAllBlogsModel,
  ViewPostsOfBlogModel,
  BlogOutputModel,
} from './models/output/blog.output.model';
import { CreateBlogInputModel } from './models/input/create-blog.input.model';
import { UpdateBlogInputModel } from './models/input/update-blog.input.model';

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
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import {
  JwtAccessGuard,
  JwtAccessGuardMongo,
} from '../../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { HTTP_STATUS_CODE } from '../../../../infrastructure/utils/enums/http-status';
import { PostsQueryRepository } from '../../../posts/infrastructure/query.repository/posts.query.repository';
import { PostsService } from '../../../posts/application/posts.service';
import { BlogsBloggerQueryRepository } from '../infrastructure/query.repository/blogs-blogger.query.repository';
import { BlogsBloggerService } from '../application/blogs-blogger.service';
import {
  CurrentUserId,
  CurrentUserIdMongo,
} from '../../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { ObjectId } from 'mongodb';
import { CreatePostByBlogIdModel } from '../../../posts/api/models/input/create-post.input.model';
import { PostTypeWithId } from '../../../posts/infrastructure/repository/posts.types.repositories';
import {
  BlogOwnerByIdGuard,
  BlogOwnerByIdGuardMongo,
} from '../../../../infrastructure/guards/blog-owner-by-id.guard';
import { UpdatePostByBlogIdInputModel } from './models/input/update-post-by-blog-id.input.model';
import { CommentsQueryRepository } from '../../../comments/infrastructure/query.repository/comments.query.repository';

@SkipThrottle()
@Controller('/hometask-nest/blogger/blogs')
export class BlogsBloggerController {
  constructor(
    protected blogsBloggerQueryRepository: BlogsBloggerQueryRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected blogsBloggerService: BlogsBloggerService,
    protected postsService: PostsService,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  @UseGuards(JwtAccessGuard)
  @Get()
  async getAllBlogs(
    @Query() query: QueryBlogInputModel,
    @CurrentUserId() userId: string,
  ): Promise<ViewAllBlogsModel> {
    const result = await this.blogsBloggerQueryRepository.getAllBlogsOfBlogger(
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

  @UseGuards(JwtAccessGuardMongo)
  @Get('comments')
  async getCommentsOfBlogger(
    @CurrentUserIdMongo() userId: ObjectId,
    @Query() query: QueryBlogInputModel,
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
    const result = await this.blogsBloggerService.createBlog(
      inputBlogModel,
      userId,
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
    const result = await this.postsService.createPostByBlogId(
      blogId,
      userId,
      inputPostModel,
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
    const result = await this.blogsBloggerService.updateBlog(
      blogId,
      inputBlogModel,
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
    const result = await this.postsService.updatePostByBlogId(
      blogId,
      postId,
      inputPostModel,
    );

    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(JwtAccessGuard, BlogOwnerByIdGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Delete(':blogId')
  async deleteBlog(@Param('blogId') blogId: string): Promise<void> {
    const result = await this.blogsBloggerService.deleteSingleBlog(blogId);
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(JwtAccessGuardMongo, BlogOwnerByIdGuardMongo)
  @Delete(':blogId/posts/:postId')
  async deletePostOfBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Res() res: Response<void>,
  ) {
    const result = await this.postsService.deleteSinglePost(postId, blogId);
    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }
}
