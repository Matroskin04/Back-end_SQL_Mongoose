import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PostsLikesInfo } from '../../../../posts/domain/posts-likes-info.entity';
import { AllLikeStatusEnum } from '../../../../../infrastructure/utils/enums/like-status.enums';
import { CommentsLikesInfo } from '../../../../comments/domain/comments-likes-info.entity';

@Injectable()
export class LikesInfoOrmQueryRepository {
  constructor(
    @InjectRepository(PostsLikesInfo)
    protected postsLikesInfoRepository: Repository<PostsLikesInfo>,
    @InjectRepository(CommentsLikesInfo)
    protected commentsLikesInfoRepository: Repository<CommentsLikesInfo>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async getLikesInfoPost(
    postId: string,
    userId: string,
  ): Promise<string | null> {
    const result = await this.postsLikesInfoRepository
      .createQueryBuilder('li')
      .select('li.likeStatus')
      .where('li.postId = :postId', { postId })
      .andWhere('li.userId = :userId', { userId })
      .getOne();

    return result ? AllLikeStatusEnum[result.likeStatus] : null;
  }

  async getLikesInfoComment(
    commentId: string,
    userId: string,
  ): Promise<string | null> {
    const result = await this.commentsLikesInfoRepository
      .createQueryBuilder('li')
      .select('li.likeStatus')
      .where('li.commentId = :commentId', { commentId })
      .andWhere('li.userId = :userId', { userId })
      .getOne();

    return result ? AllLikeStatusEnum[result.likeStatus] : null;
  }
}
