import { BlogInstanceType } from './blogs-sa.types.repositories';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Blog } from '../../../domain/blogs.entity';
import { BlogModelType } from '../../../domain/blogs.db.types';
import { ObjectId } from 'mongodb';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class BlogsSARepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}
  //SQL
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

  //MONGO
  async save(blog: BlogInstanceType): Promise<void> {
    await blog.save();
    return;
  }
}
