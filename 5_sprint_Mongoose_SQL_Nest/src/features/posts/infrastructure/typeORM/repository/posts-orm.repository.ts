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
    userId: string | null,
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
        userId: userId ?? undefined,
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
    const result = await this.postsRepository
      .createQueryBuilder()
      .update()
      .set({
        title: postDTO.title,
        shortDescription: postDTO.shortDescription,
        content: postDTO.content,
      })
      .where('id = :postId', { postId })
      .execute();

    return result.affected === 1;
  }

  async deleteSinglePost(postId: string): Promise<boolean> {
    const result = await this.postsRepository
      .createQueryBuilder()
      .delete()
      .where('id = :postId', { postId })
      .execute();

    return result.affected === 1;
  }
}
