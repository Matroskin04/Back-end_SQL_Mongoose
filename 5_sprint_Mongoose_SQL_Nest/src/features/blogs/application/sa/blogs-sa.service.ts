import { InjectModel } from '@nestjs/mongoose';
import { BlogModelType } from '../../domain/blogs.db.types';
import { Blog } from '../../domain/blogs.entity';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersSAQueryRepository } from '../../../users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { BlogsQueryRepository } from '../../infrastructure/query.repository/blogs.query.repository';
import { BlogsRepository } from '../../infrastructure/repository/blogs.repository';

@Injectable()
export class BlogsSAService {
  constructor(
    @InjectModel(Blog.name)
    private BlogModel: BlogModelType,
    protected blogsRepository: BlogsRepository,
    protected blogsPublicQueryRepository: BlogsQueryRepository,
    protected usersQueryRepository: UsersSAQueryRepository,
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
  /* async createBlog(inputBodyBlog: BodyBlogType): Promise<BlogViewType> {
    const blog = this.BlogModel.createInstance(inputBodyBlog, this.BlogModel);
    await this.blogsRepository.save(blog);

    return blog.modifyIntoViewModel();
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
  }*/
}
