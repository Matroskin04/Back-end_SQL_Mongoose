import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { BanInfoBloggerType } from '../dto/ban-info.dto';
import { UsersRepository } from '../../../infrastructure/SQL/repository/users.repository';
import { UsersQueryRepository } from '../../../infrastructure/SQL/query.repository/users.query.repository';

export class UpdateUserBanInfoForBlogCommand {
  constructor(public userId: string, public banInfo: BanInfoBloggerType) {}
}

@CommandHandler(UpdateUserBanInfoForBlogCommand)
export class UpdateUserBanInfoForBlogUseCase
  implements ICommandHandler<UpdateUserBanInfoForBlogCommand>
{
  constructor(
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}
  async execute(command: UpdateUserBanInfoForBlogCommand): Promise<void> {
    const { userId, banInfo } = command;

    const userLogin = await this.usersQueryRepository.getUserLoginById(userId);
    if (!userLogin) throw new NotFoundException('User login is not found');

    if (banInfo.isBanned) {
      //if isBanned = true
      //insert info about banned user of blog
      await this.usersRepository.createInfoBannedUserOfBlog(
        userId,
        banInfo.blogId,
        banInfo.banReason,
        banInfo.isBanned,
      );
    } else {
      //delete info
      const result = await this.usersRepository.deleteInfoBannedUserOfBlog(
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
