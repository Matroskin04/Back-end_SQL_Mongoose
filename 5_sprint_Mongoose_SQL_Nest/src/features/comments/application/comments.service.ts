import { ObjectId } from 'mongodb';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { UsersSAQueryRepository } from '../../users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { CommentsQueryRepository } from '../infrastructure/query.repository/comments.query.repository';
import { LikesInfoQueryRepository } from '../../likes-info/infrastructure/query.repository/likes-info.query.repository';
import { LikesInfoService } from '../../likes-info/application/likes-info.service';
import { CommentViewType } from '../infrastructure/repository/comments.types.repositories';
import { CommentsRepository } from '../infrastructure/repository/comments.repository';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '../../posts/domain/posts.entity';
import { PostModelType } from '../../posts/domain/posts.db.types';
import { modifyComment } from '../../../infrastructure/utils/functions/features/comments.functions.helpers';
import { LikeStatus } from '../../../infrastructure/utils/enums/like-status';
import { Comment } from '../domain/comments.entity';
import { CommentModelType } from '../domain/comments.db.types';
import { LikesInfoRepository } from '../../likes-info/infrastructure/repository/likes-info.repository';
import { PostsRepository } from '../../posts/infrastructure/repository/posts.repository';

@Injectable()
export class CommentsService {
  constructor(
    @InjectModel(Post.name)
    private PostModel: PostModelType,
    @InjectModel(Comment.name)
    private CommentModel: CommentModelType,
    protected commentsRepository: CommentsRepository,
    protected postsRepository: PostsRepository,
    protected usersQueryRepository: UsersSAQueryRepository,
    protected commentsQueryRepository: CommentsQueryRepository,
    protected likesInfoService: LikesInfoService,
    protected likesInfoRepository: LikesInfoRepository,
    protected likesInfoQueryRepository: LikesInfoQueryRepository,
  ) {}

  async updateComment(
    commentId: ObjectId,
    userId: string,
    content: string,
  ): Promise<boolean> {
    const comment = await this.commentsRepository.getCommentInstance(commentId);
    if (!comment) return false;
    if (comment.commentatorInfo.userId !== userId)
      throw new ForbiddenException();

    comment.content = content;
    await this.commentsRepository.save(comment);

    return true;
  }

  async deleteComment(commentId: ObjectId, userId: string): Promise<boolean> {
    const comment = await this.CommentModel.findOne({ _id: commentId });
    if (!comment) return false;
    if (comment.commentatorInfo.userId !== userId)
      throw new ForbiddenException();
    return this.commentsRepository.deleteComment(commentId);
  }

  async createCommentByPostId(
    content: string,
    userId: ObjectId,
    postId: string,
  ): Promise<null | CommentViewType> {
    const user = await this.usersQueryRepository.getUserByUserId(userId);
    if (!user) {
      return null;
    }

    const post = await this.postsRepository.getPostById(new ObjectId(postId));
    if (!post) {
      return null;
    }

    const comment = this.CommentModel.createInstance(
      content,
      userId.toString(),
      user.login,
      postId,
      this.CommentModel,
    );

    await this.commentsRepository.save(comment);
    return modifyComment(comment, 'None');
  }

  async updateLikeStatusOfComment(
    commentId: string,
    userId: ObjectId,
    likeStatus: LikeStatus,
  ): Promise<boolean> {
    const comment = await this.commentsQueryRepository.getCommentById(
      commentId,
      userId,
    );
    if (!comment) {
      return false;
    }

    const likeInfo =
      await this.likesInfoQueryRepository.getLikesInfoByCommentAndUser(
        commentId,
        userId.toString(),
      );
    //если не существует, то у пользователя 'None'
    if (!likeInfo) {
      if (likeStatus === 'None') return true; //Если статусы совпадают, то ничего не делаем
      //Иначе увеличиваем количество лайков/дизлайков
      const result =
        await this.likesInfoRepository.incrementNumberOfLikesOfComment(
          commentId,
          likeStatus,
        );
      if (!result) {
        throw new Error('Incrementing number of likes failed');
      }
      //Создаю like info
      await this.likesInfoService.createLikeInfoComment(
        userId.toString(),
        commentId,
        likeStatus,
      );
      return true;
    }

    //Если существует likeInfo, то:
    if (likeStatus === likeInfo.statusLike) {
      //Если статусы совпадают, то ничего не делаем;
      return true;
    }
    //Если пришел статус None, то:
    if (likeStatus === 'None') {
      //уменьшаю на 1 то, что убрали
      const result =
        await this.likesInfoRepository.decrementNumberOfLikesOfComment(
          commentId,
          likeInfo.statusLike,
        );
      if (!result) {
        throw new Error('Decrementing number of likes failed');
      }
      //И удаляю информацию
      const isDeleted = await this.likesInfoService.deleteLikeInfoComment(
        userId.toString(),
        commentId,
      );
      if (!isDeleted) {
        throw new Error('Deleting like info of comment failed');
      }

      return true;
    }

    //Если пришел like/dislike, то
    //обновляю информацию
    const isUpdate = await this.likesInfoService.updateCommentLikeInfo(
      userId.toString(),
      commentId,
      likeStatus,
    );
    if (!isUpdate) {
      throw new Error('Like status of the comment is not updated');
    }
    //увеличиваю на 1 то, что пришло
    const result1 =
      await this.likesInfoRepository.incrementNumberOfLikesOfComment(
        commentId,
        likeStatus,
      );
    if (!result1) {
      throw new Error('Incrementing number of likes failed');
    }
    //уменьшаю на 1 то, что убрали
    const result2 =
      await this.likesInfoRepository.decrementNumberOfLikesOfComment(
        commentId,
        likeInfo.statusLike,
      );
    if (!result2) {
      throw new Error('Decrementing number of likes failed');
    }

    return true;
  }
}
