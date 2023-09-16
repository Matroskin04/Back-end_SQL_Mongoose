import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/SQL/repository/comments.repository';
import { CommentsQueryRepository } from '../../infrastructure/SQL/query.repository/comments.query.repository';
import { CommentsLikesRepository } from '../../infrastructure/SQL/subrepository/comments-likes.repository';
import { CommentsOrmRepository } from '../../infrastructure/typeORM/repository/comments-orm.repository';
import { CommentsLikesOrmRepository } from '../../infrastructure/typeORM/subrepository/comments-likes-orm.repository';
import { CommentsOrmQueryRepository } from '../../infrastructure/typeORM/query.repository/comments-orm.query.repository';

export class DeleteCommentCommand {
  constructor(public commentId: string, public userId: string) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase
  implements ICommandHandler<DeleteCommentCommand>
{
  constructor(
    protected commentsOrmRepository: CommentsOrmRepository,
    protected commentsLikesOrmRepository: CommentsLikesOrmRepository,
    protected commentsOrmQueryRepository: CommentsOrmQueryRepository,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<boolean> {
    const { commentId, userId } = command;

    const comment = await this.commentsOrmQueryRepository.getCommentDBInfoById(
      commentId,
    );

    if (!comment) return false;
    if (comment.userId !== userId) throw new ForbiddenException();

    await this.commentsLikesOrmRepository.deleteAllLikesInfoOfComment(
      commentId,
    );
    await this.commentsOrmRepository.deleteComment(commentId);
    return true;
  }
}
