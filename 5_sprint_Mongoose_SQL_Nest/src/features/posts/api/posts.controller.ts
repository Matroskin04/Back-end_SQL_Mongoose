import { QueryPostInputModel } from './models/input/query-post.input.model';
import {
  ViewAllPostsModel,
  PostOutputModel,
} from './models/output/post.output.model';
import { PostsQueryRepository } from '../infrastructure/query.repository/posts.query.repository';
import {
  ViewAllCommentsOfPostModel,
  ViewCommentOfPostModel,
} from './models/output/comments-of-post.output.model';
import { PostsService } from '../application/posts.service';
import {
  Body,
  Controller,
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
import { CommentsQueryRepository } from '../../comments/infrastructure/query.repository/comments.query.repository';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { JwtAccessNotStrictGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access-not-strict.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { JwtAccessGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { CreateCommentByPostIdModel } from '../../comments/api/models/input/create-comment.input.model';
import { CommentsService } from '../../comments/application/comments.service';
import { UpdatePostLikeStatusModel } from './models/input/update-like-status.input.model';
import { SkipThrottle } from '@nestjs/throttler';
import { IsUserBannedByJWTGuard } from '../../../infrastructure/guards/is-user-banned.guard';
import { IsUserBannedForBlogGuard } from '../../../infrastructure/guards/blogs-comments-posts-guards/is-user-banned-for-blog.guard';

@SkipThrottle()
@Controller('/hometask-nest/posts')
export class PostsController {
  constructor(
    protected postsQueryRepository: PostsQueryRepository,
    protected postsService: PostsService,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected commentsService: CommentsService,
  ) {}

  @UseGuards(JwtAccessNotStrictGuard)
  @Get()
  async getAllPosts(
    @Query() query: QueryPostInputModel,
    @CurrentUserId() userId: string | null,
  ): Promise<ViewAllPostsModel> {
    const result = await this.postsQueryRepository.getAllPosts(query, userId);
    return result;
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':id')
  async getPostById(
    @Param('id') postId: string,
    @CurrentUserId() userId: string | null,
  ): Promise<PostOutputModel> {
    const result = await this.postsQueryRepository.getPostByIdView(
      postId,
      userId,
    );
    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':postId/comments')
  async getAllCommentsOfPost(
    @Param('postId') postId: string,
    @CurrentUserId() userId: string | null,
    @Query() query: QueryPostInputModel,
  ): Promise<ViewAllCommentsOfPostModel> {
    const result = await this.commentsQueryRepository.getCommentsOfPostView(
      postId,
      query,
      userId,
    );

    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessGuard, IsUserBannedByJWTGuard, IsUserBannedForBlogGuard)
  @Post(':postId/comments')
  async createCommentByPostId(
    @Param('postId') postId: string,
    @CurrentUserId() userId: string,
    @Body() inputCommentModel: CreateCommentByPostIdModel,
  ): Promise<ViewCommentOfPostModel> {
    const result = await this.commentsService.createCommentByPostId(
      inputCommentModel.content,
      userId,
      postId,
    );

    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessGuard, IsUserBannedByJWTGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':postId/like-status')
  async updateLikeStatusOfPost(
    @Param('postId') postId: string,
    @CurrentUserId() userId: string,
    @Body() inputLikeStatusModel: UpdatePostLikeStatusModel,
  ): Promise<string | void> {
    const result = await this.postsService.updateLikeStatusOfPost(
      postId.toString(),
      userId,
      inputLikeStatusModel.likeStatus,
    );

    if (!result)
      throw new NotFoundException("Post with specified id doesn't exist");
    return;
  }

  /*@UseGuards(BasicAuthGuard)
  @Delete(':id')
  async deletePost(@Param('id') postId: string, @Res() res: Response<void>) {
    const result = await this.postsService.deleteSinglePost(postId);

    result
      ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
      : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
  }

  @UseGuards(BasicAuthGuard)
@Put(':id')
async updatePost(
  @Param('id') postId: string,
  @Body() inputPostModel: UpdatePostInputModel,
  @Res() res: Response<void>,
) {
  const result = await this.postsService.updatePost(postId, inputPostModel);

  result
    ? res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204)
    : res.sendStatus(HTTP_STATUS_CODE.NOT_FOUND_404);
}

  @UseGuards(BasicAuthGuard)
@Post()
async createPost(
  @Body() inputPostModel: CreatePostInputModel,
  @Res() res: Response<PostOutputModel | string>,
) {
  const result = await this.postsService.createPost(inputPostModel);

  result
    ? res.status(HTTP_STATUS_CODE.CREATED_201).send(result)
    : res.status(HTTP_STATUS_CODE.NOT_FOUND_404).json('Blog in not found');
}*/
}
