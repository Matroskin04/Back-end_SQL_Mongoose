import { Injectable } from '@nestjs/common';
import { CommentDBType } from '../../domain/comments.db.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  //SQL

  async createComment(
    content: string,
    userId: string,
    postId: string,
  ): Promise<CommentDBType> {
    const result = await this.dataSource.query(
      `
    INSERT INTO public."comments"(
        "content", "userId", "postId")
        VALUES ($1, $2, $3)
    RETURNING "id", "content", "userId", "postId", "createdAt"`,
      [content, userId, postId],
    );
    return result[0];
  }

  async updateComment(content: string, commentId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE public."comments" 
      SET "content" = $1
        WHERE "id" = $2`,
      [content, commentId],
    );
    return result[1] === 1;
  }

  async deleteComment(commentId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM public."comments" 
        WHERE "id" = $1`,
      [commentId],
    );
    return result[1] === 1;
  }
}
