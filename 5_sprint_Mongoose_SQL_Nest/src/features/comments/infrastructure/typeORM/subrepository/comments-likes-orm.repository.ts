import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comments } from '../../../domain/comments.entity';
import { CommentsLikesInfo } from '../../../domain/comments-likes-info.entity';

@Injectable()
export class CommentsLikesOrmRepository {
  constructor(
    @InjectRepository(CommentsLikesInfo)
    protected commentsLikeInfoRepo: Repository<CommentsLikesInfo>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async deleteAllLikesInfoOfComment(
    commentId: string,
    commentsLikeInfoRepo: Repository<CommentsLikesInfo> = this
      .commentsLikeInfoRepo,
  ): Promise<void> {
    const result = commentsLikeInfoRepo
      .createQueryBuilder()
      .delete()
      .where('commentId = :commentId', { commentId })
      .execute();
    return;
  }
}
