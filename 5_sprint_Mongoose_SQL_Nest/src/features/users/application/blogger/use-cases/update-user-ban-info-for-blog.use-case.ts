import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BanInfoBloggerType } from '../dto/ban-info.dto';
import { UsersRepository } from '../../../infrastructure/SQL/repository/users.repository';
import { UsersQueryRepository } from '../../../infrastructure/SQL/query.repository/users.query.repository';
import { UsersOrmQueryRepository } from '../../../infrastructure/typeORM/query.repository/users-orm.query.repository';
import { UsersOrmRepository } from '../../../infrastructure/typeORM/repository/users-orm.repository';

export class UpdateUserBanInfoForBlogCommand {
  constructor(public userId: string, public banInfo: BanInfoBloggerType) {}
}

@CommandHandler(UpdateUserBanInfoForBlogCommand)
export class UpdateUserBanInfoForBlogUseCase
  implements ICommandHandler<UpdateUserBanInfoForBlogCommand>
{
  constructor(
    protected usersOrmRepository: UsersOrmRepository,
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
  ) {}
  async execute(command: UpdateUserBanInfoForBlogCommand): Promise<void> {
    const { userId, banInfo } = command;

    const userLogin = await this.usersOrmQueryRepository.getUserLoginById(
      userId,
    );
    if (!userLogin) throw new NotFoundException('User login is not found');

    if (banInfo.isBanned) {
      //if isBanned = true
      //insert info about banned user of blog
      await this.usersOrmRepository.createInfoBannedUserOfBlog(
        userId,
        banInfo.blogId,
        banInfo.banReason,
        banInfo.isBanned,
      );
    } else {
      //delete info
      const result = await this.usersOrmRepository.deleteInfoBannedUserOfBlog(
        userId,
        banInfo.blogId,
      );
      // if (!result)
      //   throw new NotFoundException(
      //     'Info about ban is not found. Probably, this user is already unbanned',
      //   );
    }
    return;
  }
}
