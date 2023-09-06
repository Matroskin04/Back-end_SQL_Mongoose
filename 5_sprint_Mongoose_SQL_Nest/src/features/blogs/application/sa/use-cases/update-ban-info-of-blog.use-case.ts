import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/repository/blogs.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BlogsQueryRepository } from '../../../infrastructure/query.repository/blogs.query.repository';

export class UpdateBanInfoOfBlogCommand {
  constructor(public blogId: string, public banStatus: boolean) {}
}

@CommandHandler(UpdateBanInfoOfBlogCommand)
export class UpdateBanInfoOfBlogUseCase
  implements ICommandHandler<UpdateBanInfoOfBlogCommand>
{
  constructor(
    protected blogsPublicQueryRepository: BlogsQueryRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UpdateBanInfoOfBlogCommand): Promise<boolean> {
    const { blogId, banStatus } = command;

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
