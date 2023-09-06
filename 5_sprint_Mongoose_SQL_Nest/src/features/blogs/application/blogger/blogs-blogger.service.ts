import { BodyBlogType } from '../../infrastructure/repository/blogs-blogger.types.repositories';
import { Injectable } from '@nestjs/common';
import { BlogsRepository } from '../../infrastructure/repository/blogs.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/query.repository/users.query.repository';

@Injectable()
export class BlogsBloggerService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async updateBlog(id: string, blogDTO: BodyBlogType): Promise<boolean> {
    return this.blogsRepository.updateBlog(blogDTO, id);
  }

  async deleteSingleBlog(id: string): Promise<boolean> {
    return this.blogsRepository.deleteSingleBlog(id);
  }
}
