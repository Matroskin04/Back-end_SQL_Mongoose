import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../users/infrastructure/query.repository/users.query.repository';
import { CommentsQueryRepository } from '../infrastructure/query.repository/comments.query.repository';
import { LikesInfoQueryRepository } from '../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { CommentViewType } from '../infrastructure/repository/comments.types.repositories';
import { CommentsRepository } from '../infrastructure/repository/comments.repository';
import { modifyCommentIntoInitialViewModel } from '../../../infrastructure/utils/functions/features/comments.functions.helpers';
import { AllLikeStatusType } from '../../../infrastructure/utils/enums/like-status';
import { LikesInfoRepository } from '../../likes-info/infrastructure/repository/likes-info.repository';
import { PostsQueryRepository } from '../../posts/infrastructure/query.repository/posts.query.repository';
import { CommentsLikesRepository } from '../infrastructure/subrepository/comments-likes.repository';

@Injectable()
export class CommentsService {
  constructor(
    protected commentsLikesRepository: CommentsLikesRepository,
    protected commentsRepository: CommentsRepository,
    protected postsQueryRepository: PostsQueryRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected likesInfoRepository: LikesInfoRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
  ) {}

  //SQL
  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    const comment = await this.commentsQueryRepository.getCommentDBInfoById(
      commentId,
    );

    if (!comment) return false;
    if (comment.userId !== userId) throw new ForbiddenException();

    await this.commentsLikesRepository.deleteAllLikesInfoOfComment(commentId);
    await this.commentsRepository.deleteComment(commentId);
    return true;
  }

  async createCommentByPostId(
    content: string,
    userId: string,
    postId: string,
  ): Promise<null | CommentViewType> {
    const userLogin = await this.usersQueryRepository.getUserLoginById(userId);
    if (!userLogin) {
      return null;
    }

    const post = await this.postsQueryRepository.doesPostExist(postId);
    if (!post) {
      return null;
    }

    const comment = await this.commentsRepository.createComment(
      content,
      userId,
      postId,
    );
    return modifyCommentIntoInitialViewModel(comment, userLogin, 'None');
  }

  async updateLikeStatusOfComment(
    commentId: string,
    userId: string,
    likeStatus: AllLikeStatusType,
  ): Promise<boolean> {
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
          //todo не имеет
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
        //todo имеет ли смысл в проверки
        throw new Error('Like status of the post is not updated');
      }
    }
    return true;
  }
}
