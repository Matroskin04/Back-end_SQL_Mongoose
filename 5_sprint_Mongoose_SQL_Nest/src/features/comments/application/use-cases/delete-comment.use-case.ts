import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/SQL/repository/comments.repository';
import { CommentsQueryRepository } from '../../infrastructure/SQL/query.repository/comments.query.repository';
import { CommentsLikesRepository } from '../../infrastructure/SQL/subrepository/comments-likes.repository';

export class DeleteCommentCommand {
  constructor(public commentId: string, public userId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    protected commentsRepository: CommentsRepository,
    protected commentsLikesRepository: CommentsLikesRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<boolean> {
    const { commentId, userId } = command;

    const comment = await this.commentsQueryRepository.getCommentDBInfoById(
      commentId,
    );

    if (!comment) return false;
    if (comment.userId !== userId) throw new ForbiddenException();

    await this.commentsLikesRepository.deleteAllLikesInfoOfComment(commentId);
    await this.commentsRepository.deleteComment(commentId);
    return true;
  }
}
