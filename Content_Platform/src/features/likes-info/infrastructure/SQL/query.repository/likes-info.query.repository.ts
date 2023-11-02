import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesInfoQueryRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  //SQL
  async getLikesInfoPost(
    postId: string,
    userId: string,
  ): Promise<string | null> {
    const result = await this.dataSource.query(
      `
    SELECT "likeStatus"
        FROM public."posts_likes_info"
    WHERE "postId" = $1 AND "userId" = $2;`,
      [postId, userId],
    );

    if (!result[0]) return null;
    return result[0];
  }

  async getLikesInfoComment(
    commentId: string,
    userId: string,
  ): Promise<string | null> {
    const result = await this.dataSource.query(
      `
      SELECT "likeStatus"
        FROM public."comments_likes_info"
      WHERE "commentId" = $1 AND "userId" = $2;`,
      [commentId, userId],
    );

    if (!result[0]) return null;
    return result[0];
  }
}
