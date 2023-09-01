import { BodyBlogType } from '../../infrastructure/repository/blogs-blogger.types.repositories';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../infrastructure/repository/blogs.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/query.repository/users.query.repository';
import { CreateBlogDTO } from './dto/create-blog.dto';

@Injectable()
export class BlogsBloggerService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async createBlog(
    blogDTO: BodyBlogType,
    userId: string,
  ): Promise<CreateBlogDTO> {
    const user = await this.usersQueryRepository.getUserLoginById(userId);
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
