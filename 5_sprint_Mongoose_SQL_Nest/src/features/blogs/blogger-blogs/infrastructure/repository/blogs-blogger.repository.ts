import { ObjectId } from 'mongodb';
import {
  BlogInstanceType,
  BlogOutputType,
  BodyBlogType,
} from './blogs-blogger.types.repositories';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Blog } from '../../../domain/blogs.entity';
import { BlogModelType } from '../../../domain/blogs.db.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsBloggerRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}

  //SQL
  async createBlog(
    blogDTO: BodyBlogType,
    userId: string,
  ): Promise<BlogOutputType> {
    const result = await this.dataSource.query(
      `
    INSERT INTO public.blogs(
        "name", "description", "websiteUrl", "isMembership", "userId")
        VALUES ($1, $2, $3, $4, $5)
    RETURNING "id", "name", "description", "websiteUrl", "createdAt", "isMembership"`,
      [blogDTO.name, blogDTO.description, blogDTO.websiteUrl, false, userId],
    );
    return result[0];
  }

  //MONGO
  async save(blog: BlogInstanceType): Promise<void> {
    await blog.save();
    return;
  }

  async deleteSingleBlog(blogId: ObjectId): Promise<boolean> {
    const result = await this.BlogModel.deleteOne({ _id: blogId });
    return result.deletedCount === 1;
  }

  async getBlogInstance(blogId: ObjectId): Promise<null | BlogInstanceType> {
    const blog = await this.BlogModel.findOne({ _id: blogId });

    if (blog) {
      return blog;
    }
    return null;
  }
}
