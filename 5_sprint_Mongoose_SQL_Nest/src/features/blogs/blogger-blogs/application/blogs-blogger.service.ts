import { BodyBlogType } from '../infrastructure/repository/blogs-blogger.types.repositories';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { BlogsBloggerRepository } from '../infrastructure/repository/blogs-blogger.repository';
import { BlogModelType } from '../../domain/blogs.db.types';
import { Blog } from '../../domain/blogs.entity';
import { UsersSAQueryRepository } from '../../../users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { BlogViewType } from '../infrastructure/query.repository/blogs-blogger.types.query.repository';

@Injectable()
export class BlogsBloggerService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    protected blogsRepository: BlogsBloggerRepository,
    protected usersQueryRepository: UsersSAQueryRepository,
  ) {}

  async createBlog(
    inputBodyBlog: BodyBlogType,
    userId: ObjectId,
  ): Promise<BlogViewType> {
    const user = await this.usersQueryRepository.getUserByUserId(userId);
    if (!user) throw new Error('User is not found');

    const blogInfo = {
      ...inputBodyBlog,
      blogOwnerInfo: {
        userId: userId.toString(),
        userLogin: user.login,
      },
    };

    const blog = this.BlogModel.createInstance(blogInfo, this.BlogModel);
    await this.blogsRepository.save(blog);

    return blog.modifyIntoViewGeneralModel();
  }

  async updateBlog(id: string, inputBodyBlog: BodyBlogType): Promise<boolean> {
    const blog = await this.blogsRepository.getBlogInstance(new ObjectId(id));
    if (!blog) {
      return false;
    }

    blog.updateBlogInfo(blog, inputBodyBlog);
    await this.blogsRepository.save(blog);

    return true;
  }

  async deleteSingleBlog(id: string): Promise<boolean> {
    return this.blogsRepository.deleteSingleBlog(new ObjectId(id));
  }
}
