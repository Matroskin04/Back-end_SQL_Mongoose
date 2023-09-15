import {
  BlogOutputType,
  BodyBlogType,
} from './blogs-blogger.types.repositories';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Blogs } from '../../../domain/blogs.entity';

@Injectable()
export class BlogsOrmRepository {
  constructor(
    @InjectRepository(Blogs)
    protected blogsRepository: Repository<Blogs>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createBlog(
    blogDTO: BodyBlogType,
    userId: string,
  ): Promise<BlogOutputType> {
    const { name, description, websiteUrl } = blogDTO;
    const result = await this.blogsRepository
      .createQueryBuilder()
      .insert()
      .values({
        name,
        description,
        websiteUrl,
        isMembership: false,
        userId,
      })
      .updateEntity(false)
      .returning([
        'id',
        'name',
        'description',
        'websiteUrl',
        'createdAt',
        'isMembership',
      ])
      .execute();

    return result.raw[0];
  }

  async updateBlog(blogDTO: BodyBlogType, blogId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE public."blogs"
      SET "name" = $1, "description" = $2, "websiteUrl" = $3
        WHERE "id" = $4`,
      [blogDTO.name, blogDTO.description, blogDTO.websiteUrl, blogId],
    );
    return result[1] === 1;
  }

  async updateBanInfo(blogId: string, banStatus: boolean): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE public."blogs"
      SET "isBanned" = $1, "banDate" = now()
        WHERE "id" = $2`,
      [banStatus, blogId],
    );
    return result[1] === 1;
  }

  async updateUserInfoOfBlog(blogId: string, userId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE public."blogs"
      SET "userId" = $1
        WHERE "id" = $2`,
      [userId, blogId],
    );
    return result[1] === 1;
  }

  async deleteSingleBlog(blogId: string): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM public."blogs"
      WHERE "id" = $1`,
      [blogId],
    );
    return result[1] === 1;
  }
}
