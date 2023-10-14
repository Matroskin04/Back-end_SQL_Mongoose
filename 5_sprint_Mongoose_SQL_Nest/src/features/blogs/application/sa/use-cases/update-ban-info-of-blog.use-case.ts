import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/SQL/repository/blogs.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BlogsQueryRepository } from '../../../infrastructure/SQL/query.repository/blogs.query.repository';
import { BlogsOrmRepository } from '../../../infrastructure/typeORM/repository/blogs-orm.repository';
import { BlogsOrmQueryRepository } from '../../../infrastructure/typeORM/query.repository/blogs-orm.query.repository';

export class UpdateBanInfoOfBlogCommand {
  constructor(public blogId: string, public banStatus: boolean) {}
}

@CommandHandler(UpdateBanInfoOfBlogCommand)
export class UpdateBanInfoOfBlogUseCase
  implements ICommandHandler<UpdateBanInfoOfBlogCommand>
{
  constructor(
    protected blogsOrmQueryRepository: BlogsOrmQueryRepository,
    protected blogsOrmRepository: BlogsOrmRepository,
  ) {}

  async execute(command: UpdateBanInfoOfBlogCommand): Promise<boolean> {
    const { blogId, banStatus } = command;

    const blog = await this.blogsOrmQueryRepository.getBlogAllInfoById(blogId);

    if (!blog) throw new NotFoundException('Blog is not found');

    if (blog.isBanned === banStatus)
      throw new BadRequestException([
        {
          message: `This blog is already ${banStatus ? 'banned' : 'unbanned'}`,
          field: 'isBanned',
        },
      ]);

    const isUpdate = await this.blogsOrmRepository.updateBanInfo(
      blogId,
      banStatus,
    );
    return isUpdate;
  }
}
