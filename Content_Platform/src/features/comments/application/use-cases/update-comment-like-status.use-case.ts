import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsOrmQueryRepository } from '../../infrastructure/typeORM/query.repository/comments-orm.query.repository';
import { LikesInfoOrmRepository } from '../../../likes-info/infrastructure/typeORM/repository/likes-info-orm.repository';
import { LikesInfoOrmQueryRepository } from '../../../likes-info/infrastructure/typeORM/query.repository/likes-info-orm.query.repository';
import { AllLikeStatusType } from '../../../../infrastructure/types/like-status.general.types';

export class UpdateCommentLikeStatusCommand {
  constructor(
    public commentId: string,
    public userId: string,
    public likeStatus: AllLikeStatusType,
  ) {}
}

@CommandHandler(UpdateCommentLikeStatusCommand)
export class UpdateCommentLikeStatusUseCase
  implements ICommandHandler<UpdateCommentLikeStatusCommand>
{
  constructor(
    protected commentsOrmQueryRepository: CommentsOrmQueryRepository,
    protected likesInfoOrmRepository: LikesInfoOrmRepository,
    protected likesInfoOrmQueryRepository: LikesInfoOrmQueryRepository,
  ) {}

  async execute(command: UpdateCommentLikeStatusCommand): Promise<boolean> {
    const { commentId, userId, likeStatus } = command;

    const comment = await this.commentsOrmQueryRepository.getCommentDBInfoById(
      commentId,
    );
    if (!comment) {
      return false;
    }

    //check of existing LikeInfo
    const likeInfo = await this.likesInfoOrmQueryRepository.getLikesInfoComment(
      commentId,
      userId,
    );

    //if likeInfo doesn't exist, then user has like status 'None'
    if (!likeInfo) {
      if (likeStatus === 'None') return true; //If statuses are the same, then just return true
      //Otherwise create like info
      await this.likesInfoOrmRepository.createLikeInfoOfComment(
        userId,
        commentId,
        likeStatus,
      );
      return true;
    } else {
      //if new like status = 'None' - then delete info
      if (likeStatus === 'None') {
        const isDeleted =
          await this.likesInfoOrmRepository.deleteLikeInfoComment(
            userId,
            commentId,
          );
        if (!isDeleted) {
          throw new Error('Like status of the comment is not deleted');
        }
        return true;
      }
      //if not "None", then change like status
      const isUpdate = await this.likesInfoOrmRepository.updateCommentLikeInfo(
        userId,
        commentId,
        likeStatus,
      );
      if (!isUpdate) {
        throw new Error('Like status of the comment is not updated');
      }
    }
    return true;
  }
}
