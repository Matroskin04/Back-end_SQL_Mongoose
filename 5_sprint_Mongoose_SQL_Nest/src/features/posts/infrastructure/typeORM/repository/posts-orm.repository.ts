import { BodyPostByBlogIdType, PostDBType } from './posts.types.repositories';
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class PostsOrmRepository {
  constructor(@InjectDataSource() protected dataSource: DataSource) {}

  //SQL
  async createPost(
    postDTO: BodyPostByBlogIdType,
    blogId: string,
    userId: string,
  ): Promise<PostDBType> {
    const result = await this.dataSource.query(
      `
    INSERT INTO public."posts"(
        "title", "shortDescription", "content", "blogId", "userId")
        VALUES ($1, $2, $3, $4, $5)
    RETURNING "id", "title", "shortDescription", "content", "blogId", "userId", "createdAt"`,
      [
        postDTO.title,
        postDTO.shortDescription,
        postDTO.content,
        blogId,
        userId,
      ],
    );
    return result[0];
  }

  async updatePost(
    postDTO: BodyPostByBlogIdType,
    postId: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE public."posts"
      SET "title" = $1, "shortDescription" = $2, "content" = $3
        WHERE "id" = $4`,
      [postDTO.title, postDTO.shortDescription, postDTO.content, postId],
    );
    return result[1] === 1;
  }

  async deleteSinglePost(postId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM public."posts"
      WHERE "id" = $1`,
      [postId],
    );
    return result[1] === 1;
  }
}
