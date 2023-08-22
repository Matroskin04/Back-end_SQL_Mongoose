import { QueryBlogInputModel } from './models/input/query-blog.input.model';
import {
  ViewAllBlogsModel,
  BlogOutputModel,
  ViewPostsOfBlogModel,
} from './models/output/blog.output.model';
import { CreateBlogInputModel } from './models/input/create-blog.input.model';
import { UpdateBlogInputModel } from './models/input/update-blog.input.model';

import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { JwtAccessGuardMongo } from '../../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { HTTP_STATUS_CODE } from '../../../../infrastructure/utils/enums/http-status';
import { PostsQueryRepository } from '../../../posts/infrastructure/query.repository/posts.query.repository';
import { PostsService } from '../../../posts/application/posts.service';
import { BlogsBloggerQueryRepository } from '../infrastructure/query.repository/blogs-blogger.query.repository';
import { BlogsBloggerService } from '../application/blogs-blogger.service';
import { CurrentUserIdMongo } from '../../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { ObjectId } from 'mongodb';
import { CreatePostByBlogIdModel } from '../../../posts/api/models/input/create-post.input.model';
import { PostTypeWithId } from '../../../posts/infrastructure/repository/posts.types.repositories';
import { BlogOwnerByIdGuard } from '../../../../infrastructure/guards/blog-owner-by-id.guard';
import { UpdatePostByBlogIdInputModel } from './models/input/update-post-by-blog-id.input.model';
import { CommentsService } from '../../../comments/application/comments.service';
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

  @UseGuards(JwtAccessGuardMongo)
  @Get()
  async getAllBlogs(
    @Query() query: QueryBlogInputModel,
    @CurrentUserIdMongo() userId: ObjectId,
    @Res() res: Response<ViewAllBlogsModel>,
  ) {
    const result = await this.blogsBloggerQueryRepository.getAllBlogs(
      query,
      userId.toString(),
    );
    res.status(HTTP_STATUS_CODE.OK_200).send(result);
  }

  @UseGuards(JwtAccessGuardMongo, BlogOwnerByIdGuard)
  @Get(':blogId/posts')
  async getAllPostsOfBlog(
    @Param('blogId') blogId: string,
    @CurrentUserIdMongo() userId: ObjectId,
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

  @UseGuards(JwtAccessGuardMongo)
  @Post()
  async createBlog(
    @Body() inputBlogModel: CreateBlogInputModel,
    @CurrentUserIdMongo() userId: ObjectId,
    @Res() res: Response<BlogOutputModel>,
  ) {
    const result = await this.blogsBloggerService.createBlog(
      inputBlogModel,
      userId,
    );
    res.status(HTTP_STATUS_CODE.CREATED_201).send(result);
  }

  @UseGuards(JwtAccessGuardMongo, BlogOwnerByIdGuard)
  @Post(`/:blogId/posts`)
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @CurrentUserIdMongo() userId: ObjectId,
    @Body() inputPostModel: CreatePostByBlogIdModel,
    @Res() res: Response<PostTypeWithId>,
  ) {
    const result = await this.postsService.createPostByBlogId(
      blogId,
      userId,
      inputPostModel,
    );
    result
      ? res.status(HTTP_STATUS_CODE.CREATED_201).send(result)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(JwtAccessGuardMongo, BlogOwnerByIdGuard)
  @Put(':blogId')
  async updateBlog(
    @Param('blogId') blogId: string,
    @Body() inputBlogModel: UpdateBlogInputModel,
    @Res() res: Response<void>,
  ) {
    const result = await this.blogsBloggerService.updateBlog(
      blogId,
      inputBlogModel,
    );
    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(JwtAccessGuardMongo, BlogOwnerByIdGuard)
  @Put(':blogId/posts/:postId')
  async updatePostOfBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Body() inputPostModel: UpdatePostByBlogIdInputModel,
    @Res() res: Response<void>,
  ) {
    const result = await this.postsService.updatePostByBlogId(
      blogId,
      postId,
      inputPostModel,
    );

    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(JwtAccessGuardMongo, BlogOwnerByIdGuard)
  @Delete(':blogId')
  async deleteBlog(
    @Param('blogId') blogId: string,
    @Res() res: Response<void>,
  ) {
    const result = await this.blogsBloggerService.deleteSingleBlog(blogId);
    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(JwtAccessGuardMongo, BlogOwnerByIdGuard)
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
