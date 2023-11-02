import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsOrmRepository } from '../../infrastructure/typeORM/repository/comments-orm.repository';
import { CommentsLikesOrmRepository } from '../../infrastructure/typeORM/subrepository/comments-likes-orm.repository';
import { CommentsOrmQueryRepository } from '../../infrastructure/typeORM/query.repository/comments-orm.query.repository';
import { startTransaction } from '../../../../infrastructure/utils/functions/db-helpers/transaction.helpers';
import { DataSource } from 'typeorm';
import { Comments } from '../../domain/comments.entity';
import { CommentsLikesInfo } from '../../domain/comments-likes-info.entity';
import { InjectDataSource } from '@nestjs/typeorm';

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
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async execute(command: DeleteCommentCommand): Promise<boolean> {
    const { commentId, userId } = command;

    const comment = await this.commentsOrmQueryRepository.getCommentDBInfoById(
      commentId,
    );

    if (!comment) return false;
    if (comment.userId !== userId) throw new ForbiddenException();

    //start transaction
    const dataForTransaction = await startTransaction(this.dataSource, [
      Comments,
      CommentsLikesInfo,
    ]);
    try {
      await this.commentsLikesOrmRepository.deleteAllLikesInfoOfComment(
        commentId,
        dataForTransaction.repositories.CommentsLikesInfo,
      );
      await this.commentsOrmRepository.deleteComment(
        commentId,
        dataForTransaction.repositories.Comments,
      );

      // commit transaction now:
      await dataForTransaction.queryRunner.commitTransaction();

      return true;
    } catch (err) {
      await dataForTransaction.queryRunner.rollbackTransaction();
      console.error('Deletion comment failed:', err);
      return false;
    } finally {
      // you need to release query runner which is manually created:
      await dataForTransaction.queryRunner.release();
    }
  }
}
