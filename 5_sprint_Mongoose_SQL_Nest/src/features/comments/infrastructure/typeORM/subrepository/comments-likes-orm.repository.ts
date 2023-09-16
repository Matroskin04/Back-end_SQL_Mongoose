import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Comments } from '../../../domain/comments.entity';
import { CommentsLikesInfo } from '../../../domain/comments-likes-info.entity';

@Injectable()
export class CommentsLikesOrmRepository {
  constructor(
    @InjectRepository(CommentsLikesInfo)
    protected commentsRepository: Repository<CommentsLikesInfo>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async deleteAllLikesInfoOfComment(commentId: string): Promise<void> {
    const result = await this.commentsRepository
      .createQueryBuilder()
      .delete()
      .where('commentId = :commentId', { commentId })
      .execute();
    return;
  }
}
