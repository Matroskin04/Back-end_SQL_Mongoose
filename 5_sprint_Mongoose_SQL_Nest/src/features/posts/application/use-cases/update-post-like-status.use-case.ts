import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  BodyPostByBlogIdType,
  PostTypeWithId,
} from '../../infrastructure/repository/posts.types.repositories';
import { BlogsQueryRepository } from '../../../blogs/infrastructure/query.repository/blogs.query.repository';
import { modifyPostIntoInitialViewModel } from '../../../../infrastructure/utils/functions/features/posts.functions.helpers';
import { PostsRepository } from '../../infrastructure/repository/posts.repository';
import { AllLikeStatusType } from '../../../../infrastructure/utils/enums/like-status';
import { PostsQueryRepository } from '../../infrastructure/query.repository/posts.query.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/SQL/query.repository/users.query.repository';
import { LikesInfoQueryRepository } from '../../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { LikesInfoRepository } from '../../../likes-info/infrastructure/repository/likes-info.repository';

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
    protected postsQueryRepository: PostsQueryRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
    protected likesInfoRepository: LikesInfoRepository,
  ) {}

  async execute(command: UpdatePostLikeStatusCommand): Promise<boolean> {
    const { postId, userId, likeStatus } = command;

    const post = await this.postsQueryRepository.doesPostExist(postId);
    if (!post) {
      return false;
    }
    //check of existing LikeInfo
    const likeInfo = await this.likesInfoQueryRepository.getLikesInfoPost(
      postId,
      userId,
    );
    //если не существует likeInfo, то у пользователя 'None'
    if (!likeInfo) {
      if (likeStatus === 'None') return true; //Если статусы совпадают, то ничего не делаем
      //Otherwise create like info
      await this.likesInfoRepository.createLikeInfoOfPost(
        userId,
        postId,
        likeStatus,
      );
    } else {
      //меняем статус лайка
      const isUpdate = await this.likesInfoRepository.updatePostLikeInfo(
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
