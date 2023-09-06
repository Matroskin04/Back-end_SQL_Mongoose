import {
  BodyPostByBlogIdType,
  PostTypeWithId,
} from '../infrastructure/repository/posts.types.repositories';
import { PostsRepository } from '../infrastructure/repository/posts.repository';
import { modifyPostIntoInitialViewModel } from '../../../infrastructure/utils/functions/features/posts.functions.helpers';
import { LikesInfoQueryRepository } from '../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { AllLikeStatusType } from '../../../infrastructure/utils/enums/like-status';
import { UsersQueryRepository } from '../../users/infrastructure/query.repository/users.query.repository';
import { PostsQueryRepository } from '../infrastructure/query.repository/posts.query.repository';
import { LikesInfoRepository } from '../../likes-info/infrastructure/repository/likes-info.repository';
import { BodyForUpdatePostDto } from './dto/body-for-update-post.dto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsService {
  constructor(
    protected postsRepository: PostsRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
    protected likesInfoRepository: LikesInfoRepository,
  ) {}

  async updateLikeStatusOfPost(
    postId: string,
    userId: string,
    likeStatus: AllLikeStatusType,
  ) {
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
        //todo имеет ли смысл в проверки
        throw new Error('Like status of the post is not updated');
      }
    }
    return true;
  }

  async deleteSinglePost(postId: string): Promise<boolean> {
    return this.postsRepository.deleteSinglePost(postId);
  }
}
