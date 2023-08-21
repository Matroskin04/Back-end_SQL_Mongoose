import { ObjectId } from 'mongodb';
import { BlogInstanceType } from './blogs-blogger.types.repositories';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { Blog } from '../../../domain/blogs.entity';
import { BlogModelType } from '../../../domain/blogs.db.types';

@Injectable()
export class BlogsBloggerRepository {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
  ) {}
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
