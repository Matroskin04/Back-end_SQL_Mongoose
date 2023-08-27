import { BodyBlogType } from '../../blogger-blogs/infrastructure/repository/blogs-blogger.types.repositories';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { BlogsBloggerRepository } from '../../blogger-blogs/infrastructure/repository/blogs-blogger.repository';
import { BlogModelType } from '../../domain/blogs.db.types';
import { Blog } from '../../domain/blogs.entity';
import { UsersSAQueryRepository } from '../../../users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { BlogViewType } from '../../blogger-blogs/infrastructure/query.repository/blogs-blogger.types.query.repository';

@Injectable()
export class BlogsBloggerService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    protected blogsRepository: BlogsBloggerRepository,
    protected usersQueryRepository: UsersSAQueryRepository,
  ) {}

  async createBlog(
    blogDTO: BodyBlogType,
    userId: string,
  ): Promise<BlogViewType> {
    const user = await this.usersQueryRepository.getUserLoginByUserId(userId);
    if (!user) throw new Error('User is not found');

    const result = await this.blogsRepository.createBlog(blogDTO, userId);
    return result;
  }

  async updateBlog(id: string, blogDTO: BodyBlogType): Promise<boolean> {
    return this.blogsRepository.updateBlog(blogDTO, id);
  }

  async deleteSingleBlog(id: string): Promise<boolean> {
    return this.blogsRepository.deleteSingleBlog(id);
  }
}
