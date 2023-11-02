import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsOrmRepository } from '../../../infrastructure/typeORM/repository/blogs-orm.repository';
import { UsersOrmQueryRepository } from '../../../../users/infrastructure/typeORM/query.repository/users-orm.query.repository';

export class BindBlogWithUserCommand {
  constructor(public blogId: string, public userId: string) {}
}

@CommandHandler(BindBlogWithUserCommand)
export class BindBlogWithUserUseCase
  implements ICommandHandler<BindBlogWithUserCommand>
{
  constructor(
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
    protected blogsOrmRepository: BlogsOrmRepository,
  ) {}

  async execute(command: BindBlogWithUserCommand): Promise<boolean> {
    const { userId, blogId } = command;

    const user = await this.usersOrmQueryRepository.getUserLoginById(userId);
    if (!user) {
      return false;
    }

    const isUpdate = await this.blogsOrmRepository.updateUserInfoOfBlog(
      blogId,
      userId,
    );
    return isUpdate;
  }
}
