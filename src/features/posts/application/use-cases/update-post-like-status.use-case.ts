import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsOrmQueryRepository } from '../../infrastructure/typeORM/query.repository/posts-orm.query.repository';
import { LikesInfoOrmQueryRepository } from '../../../likes-info/infrastructure/typeORM/query.repository/likes-info-orm.query.repository';
import { LikesInfoOrmRepository } from '../../../likes-info/infrastructure/typeORM/repository/likes-info-orm.repository';
import { AllLikeStatusType } from '../../../../infrastructure/types/like-status.general.types';

export class UpdatePostLikeStatusCommand {
  constructor(
    public postId: string,
    public userId: string,
    public likeStatus: AllLikeStatusType,
  ) {}
}

@CommandHandler(UpdatePostLikeStatusCommand)
export class UpdatePostLikeStatusUseCase
  implements ICommandHandler<UpdatePostLikeStatusCommand>
{
  constructor(
    protected postsOrmQueryRepository: PostsOrmQueryRepository,
    protected likesInfoOrmQueryRepository: LikesInfoOrmQueryRepository,
    protected likesInfoOrmRepository: LikesInfoOrmRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<boolean> {
    const { postId, userId, likeStatus } = command;

    const post = await this.postsOrmQueryRepository.doesPostExist(postId);
    if (!post) {
      return false;
    }
    //check of existing LikeInfo
    const likeInfo = await this.likesInfoOrmQueryRepository.getLikesInfoPost(
      postId,
      userId,
    );
    //если не существует likeInfo, то у пользователя 'None'
    if (!likeInfo) {
      if (likeStatus === 'None') return true; //Если статусы совпадают, то ничего не делаем
      //Otherwise create like info
      await this.likesInfoOrmRepository.createLikeInfoOfPost(
        userId,
        postId,
        likeStatus,
      );
    } else {
      //меняем статус лайка
      const isUpdate = await this.likesInfoOrmRepository.updatePostLikeInfo(
        userId,
        postId,
        likeStatus,
      );
      if (!isUpdate) {
        throw new Error('Like status of the post is not updated');
      }
    }
    return true;
  }
}
