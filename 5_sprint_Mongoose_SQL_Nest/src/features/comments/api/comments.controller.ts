import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentOutputModel } from './models/output/comment.output.model';
import { CommentsQueryRepository } from '../infrastructure/SQL/query.repository/comments.query.repository';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { JwtAccessGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access.guard';
import { CurrentUserId } from '../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { UpdateCommentInputModel } from './models/input/update-comment.input.model';
import { UpdateCommentLikeStatusInputModel } from './models/input/update-comment-like-status.input.model';
import { JwtAccessNotStrictGuard } from '../../../infrastructure/guards/authorization-guards/jwt-access-not-strict.guard';
import { IsUserBannedByJWTGuard } from '../../../infrastructure/guards/is-user-banned.guard';
import { CommandBus } from '@nestjs/cqrs';
import { UpdateCommentCommand } from '../application/use-cases/update-comment.use-case';
import { DeleteCommentCommand } from '../application/use-cases/delete-comment.use-case';
import { UpdateCommentLikeStatusCommand } from '../application/use-cases/update-comment-like-status.use-case';
import { CommentsOrmQueryRepository } from '../infrastructure/typeORM/query.repository/comments-orm.query.repository';

@Controller('/hometask-nest/comments')
export class CommentsController {
  constructor(
    protected commandBus: CommandBus,
    protected commentsOrmQueryRepositoryc: CommentsOrmQueryRepository,
  ) {}

  @UseGuards(JwtAccessNotStrictGuard)
  @Get(':id')
  async getCommentById(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string | null,
  ): Promise<CommentOutputModel> {
    const result = await this.commentsOrmQueryRepositoryc.getCommentByIdView(
      commentId,
      userId,
    );

    if (!result) throw new NotFoundException();
    return result;
  }

  @UseGuards(JwtAccessGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':id')
  async updateComment(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string,
    @Body() inputCommentModel: UpdateCommentInputModel,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new UpdateCommentCommand(commentId, userId, inputCommentModel.content),
    );
    if (!result) throw new NotFoundException();
    return;
  }

  @UseGuards(JwtAccessGuard, IsUserBannedByJWTGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Put(':id/like-status')
  async updateLikeStatusOfComment(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string,
    @Body() inputLikeInfoModel: UpdateCommentLikeStatusInputModel,
  ): Promise<string | void> {
    const result = await this.commandBus.execute(
      new UpdateCommentLikeStatusCommand(
        commentId,
        userId,
        inputLikeInfoModel.likeStatus,
      ),
    );

    if (!result)
      throw new NotFoundException("Comment with specified id doesn't exist");
    return;
  }

  @UseGuards(JwtAccessGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Delete(':id')
  async deleteComment(
    @Param('id') commentId: string,
    @CurrentUserId() userId: string,
  ): Promise<void> {
    const result = await this.commandBus.execute(
      new DeleteCommentCommand(commentId, userId),
    );

    if (!result) throw new NotFoundException();
    return;
  }
}
