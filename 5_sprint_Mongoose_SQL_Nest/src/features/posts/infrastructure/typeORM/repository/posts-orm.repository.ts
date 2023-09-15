import { BodyPostByBlogIdType, PostDBType } from './posts.types.repositories';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Blogs } from '../../../../blogs/domain/blogs.entity';
import { Posts } from '../../../domain/posts.entity';

@Injectable()
export class PostsOrmRepository {
  constructor(
    @InjectRepository(Posts)
    protected postsRepository: Repository<Posts>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  //SQL
  async createPost(
    postDTO: BodyPostByBlogIdType,
    blogId: string,
    userId: string,
  ): Promise<PostDBType> {
    const { title, shortDescription, content } = postDTO;
    const result = await this.postsRepository
      .createQueryBuilder()
      .insert()
      .values({
        title,
        shortDescription,
        content,
        blogId,
        userId,
      })
      .returning([
        'id',
        'title',
        'shortDescription',
        'content',
        'blogId',
        'userId',
        'createdAt',
      ])
      .execute();

    return {
      ...result.raw[0],
      createdAt: result.raw[0].createdAt.toISOString(),
    };
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
