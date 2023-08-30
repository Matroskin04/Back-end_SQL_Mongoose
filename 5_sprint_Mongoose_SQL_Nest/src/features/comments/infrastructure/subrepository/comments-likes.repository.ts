import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsLikesRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  async deleteAllLikesInfoOfComment(commentId: string): Promise<void> {
    //todo not comments - comments likes info
    const result = await this.dataSource.query(
      `
    DELETE FROM public."comments_likes_info"
        WHERE "commentId" = $1`,
      [commentId],
    );
    return;
  }
}
