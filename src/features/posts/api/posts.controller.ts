import { QueryPostInputModel } from './models/input/query-post.input.model';
import {
  ViewAllPostsModel,
  PostOutputModel,
} from './models/output/post.output.model';
import {
  ViewAllCommentsOfPostModel,
  ViewCommentOfPostModel,
} from './models/output/comments-of-post.output.model';
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
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../../comments/infrastructure/SQL/query.repository/comments.query.repository';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { JwtAccessNotStrictGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access-not-strict.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/current-user-id.param.decorator';
import { JwtAccessGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { CreateCommentByPostIdModel } from '../../comments/api/models/input/create-comment.input.model';
import { UpdatePostLikeStatusModel } from './models/input/update-like-status.input.model';
import { SkipThrottle } from '@nestjs/throttler';
import { IsUserBannedByJWTGuard } from '../../../infrastructure/guards/forbidden-guards/is-user-banned.guard';
import { IsUserBannedForBlogGuard } from '../../../infrastructure/guards/forbidden-guards/is-user-banned-for-blog.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateCommentCommand } from '../../comments/application/use-cases/create-comment-by-post-id.use-case';
import { UpdatePostLikeStatusCommand } from '../application/use-cases/update-post-like-status.use-case';
import { PostsOrmQueryRepository } from '../infrastructure/typeORM/query.repository/posts-orm.query.repository';
import { CommentsOrmQueryRepository } from '../../comments/infrastructure/typeORM/query.repository/comments-orm.query.repository';

@Controller('/api/posts')
export class PostsController {
  constructor(
    protected commandBus: CommandBus,
    protected postsOrmQueryRepository: PostsOrmQueryRepository,
    protected commentsOrmQueryRepository: CommentsOrmQueryRepository,
  ) {}

  @UseGuards(JwtAccessNotStrictGuard)
  @Get()
  async getAllPosts(
    @Query() query: QueryPostInputModel,
    @CurrentUserId() userId: string | null,
  ): Promise<ViewAllPostsModel> {
    const result = await this.postsOrmQueryRepository.getAllPosts(
      query,
      userId,
    );
    return result;
  }

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':id')
  async getPostById(
    @Param('id') postId: string,
    @CurrentUserId() userId: string | null,
  ): Promise<PostOutputModel> {
    const result = await this.postsOrmQueryRepository.getPostByIdView(
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
    const result = await this.commentsOrmQueryRepository.getCommentsOfPostView(
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
    const result = await this.commandBus.execute(
      new CreateCommentCommand(postId, userId, inputCommentModel.content),
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
    const result = await this.commandBus.execute(
      new UpdatePostLikeStatusCommand(
        postId,
        userId,
        inputLikeStatusModel.likeStatus,
      ),
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
