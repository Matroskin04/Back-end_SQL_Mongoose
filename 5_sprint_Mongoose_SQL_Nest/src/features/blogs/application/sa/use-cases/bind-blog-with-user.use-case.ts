import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../../../infrastructure/SQL/repository/blogs.repository';
import { UsersQueryRepository } from '../../../../users/infrastructure/SQL/query.repository/users.query.repository';

export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase
  implements ICommandHandler<BindBlogWithUserCommand>
{
  constructor(
    protected usersQueryRepository: UsersQueryRepository,
    protected blogsRepository: BlogsRepository,
  ) {}

  async execute(command: BindBlogWithUserCommand): Promise<boolean> {
    const { userId, blogId } = command;

    const user = await this.usersQueryRepository.getUserLoginById(userId);
    if (!user) {
      return false;
    }

    const isUpdate = await this.blogsRepository.updateUserInfoOfBlog(
      blogId,
      userId,
    );
    return isUpdate;
  }
}
