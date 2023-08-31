import { SkipThrottle } from '@nestjs/throttler';
import { Injectable, NotFoundException } from '@nestjs/common';
import { BanInfoBloggerType } from './dto/ban-info.dto';
import { InjectModel } from '@nestjs/mongoose';
import { BannedUsersByBlogger } from '../../banned/banned-by-blogger-users/domain/users-banned-by-blogger.entity';
import { BannedUsersByBloggerModelType } from '../../banned/banned-by-blogger-users/domain/users-banned-by-blogger.db.types';
import { UsersQueryRepository } from '../../infrastructure/query.repository/users.query.repository';
import { UsersRepository } from '../../infrastructure/repository/users.repository';

@Injectable()
@SkipThrottle()
export class UsersBloggerService {
  constructor(
    @InjectModel(BannedUsersByBlogger.name)
    private BannedUsersByBloggerModel: BannedUsersByBloggerModelType,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async updateBanInfoOfUser(
    userId: string,
    banInfo: BanInfoBloggerType,
  ): Promise<void> {
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
