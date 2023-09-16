import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/SQL/repository/comments.repository';
import { CommentsQueryRepository } from '../../infrastructure/SQL/query.repository/comments.query.repository';
import { CommentsOrmRepository } from '../../infrastructure/typeORM/repository/comments-orm.repository';
import { CommentsOrmQueryRepository } from '../../infrastructure/typeORM/query.repository/comments-orm.query.repository';

export class UpdateCommentCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public content: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase
  implements ICommandHandler<UpdateCommentCommand>
{
  constructor(
    protected commentsOrmRepository: CommentsOrmRepository,
    protected commentsOrmQueryRepository: CommentsOrmQueryRepository,
  ) {}

  async execute(command: UpdateCommentCommand): Promise<boolean> {
    const { commentId, userId, content } = command;

    const comment = await this.commentsOrmQueryRepository.getCommentDBInfoById(
      commentId,
    );

    if (!comment) return false;
    if (comment.userId !== userId) throw new ForbiddenException();

    const isUpdate = await this.commentsOrmRepository.updateComment(
      content,
      commentId,
    );
    if (!isUpdate) throw new Error('Updating failed');

    return true;
  }
}
