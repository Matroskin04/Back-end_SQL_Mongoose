import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/repository/comments.repository';
import { CommentsQueryRepository } from '../../infrastructure/query.repository/comments.query.repository';
import { AllLikeStatusType } from '../../../../infrastructure/utils/enums/like-status';
import { LikesInfoRepository } from '../../../likes-info/infrastructure/repository/likes-info.repository';
import { LikesInfoQueryRepository } from '../../../likes-info/infrastructure/query.repository/likes-info.query.repository';

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
    protected commentsQueryRepository: CommentsQueryRepository,
    protected likesInfoRepository: LikesInfoRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
  ) {}

  async execute(command: UpdateCommentLikeStatusCommand): Promise<boolean> {
    const { commentId, userId, likeStatus } = command;

    const comment = await this.commentsQueryRepository.getCommentDBInfoById(
      commentId,
    );
    if (!comment) {
      return false;
    }

    //check of existing LikeInfo
    const likeInfo = await this.likesInfoQueryRepository.getLikesInfoComment(
      commentId,
      userId,
    );
    //if likeInfo doesn't exist, then user has like status 'None'
    if (!likeInfo) {
      if (likeStatus === 'None') return true; //If statuses are the same, then just return true
      //Otherwise create like info
      await this.likesInfoRepository.createLikeInfoOfComment(
        userId,
        commentId,
        likeStatus,
      );
    } else {
      //if new like status = 'None' - then delete info
      if (likeStatus === 'None') {
        const isDeleted = await this.likesInfoRepository.deleteLikeInfoComment(
          userId,
          commentId,
        );
        if (!isDeleted) {
          throw new Error('Like status of the comment is not deleted');
        }
        return true;
      }
      //if not "None", then change like status
      const isUpdate = await this.likesInfoRepository.updateCommentLikeInfo(
        userId,
        commentId,
        likeStatus,
      );
      if (!isUpdate) {
        throw new Error('Like status of the post is not updated');
      }
    }
    return true;
  }
}
