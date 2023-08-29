import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersQueryRepository } from '../../../users/infrastructure/query.repository/users.query.repository';
import { BlogsQueryRepository } from '../../infrastructure/query.repository/blogs.query.repository';
import { BlogsRepository } from '../../infrastructure/repository/blogs.repository';

@Injectable()
export class BlogsSAService {
  constructor(
    protected blogsRepository: BlogsRepository,
    protected blogsPublicQueryRepository: BlogsQueryRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async bindBlogWithUser(blogId: string, userId: string): Promise<boolean> {
    const user = await this.usersQueryRepository.getUserLoginByUserId(userId);
    if (!user) {
      return false;
    }

    const isUpdate = await this.blogsRepository.updateUserInfoOfBlog(
      blogId,
      userId,
    );
    return isUpdate;
  }

  async updateBanInfoOfBlog(
    blogId: string,
    banStatus: boolean,
  ): Promise<boolean> {
    const blog = await this.blogsPublicQueryRepository.getBlogAllInfoById(
      blogId,
    );
    if (!blog) throw new NotFoundException('Blog is not found');

    if (blog.isBanned === banStatus)
      throw new BadRequestException([
        {
          message: `This blog is already ${banStatus ? 'banned' : 'unbanned'}`,
          field: 'isBanned',
        },
      ]);

    const isUpdate = await this.blogsRepository.updateBanInfo(
      blogId,
      banStatus,
    );
    return isUpdate;
  }
}
