import { SkipThrottle } from '@nestjs/throttler';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BanInfoBloggerType } from './dto/ban-info.dto';
import { UsersBloggerRepository } from '../infrastructure/repository/users-blogger.repository';
import { InjectModel } from '@nestjs/mongoose';
import { BannedUsersByBlogger } from '../../banned/banned-by-blogger-users/domain/users-banned-by-blogger.entity';
import { BannedUsersByBloggerModelType } from '../../banned/banned-by-blogger-users/domain/users-banned-by-blogger.db.types';
import { UsersBloggerQueryRepository } from '../infrastructure/query.repository/users-blogger.query.repository';
import { ObjectId } from 'mongodb';
import { UsersSAQueryRepository } from '../../super-admin/infrastructure/query.repository/users-sa.query.repository';

@Injectable()
@SkipThrottle()
export class UsersBloggerService {
  constructor(
    @InjectModel(BannedUsersByBlogger.name)
    private BannedUsersByBloggerModel: BannedUsersByBloggerModelType,
    protected usersBloggerRepository: UsersBloggerRepository,
    protected usersSAQueryRepository: UsersSAQueryRepository,
  ) {}

  async updateBanInfoOfUser(
    userId: string,
    banInfo: BanInfoBloggerType,
  ): Promise<void> {
    const userLogin = await this.usersSAQueryRepository.getUserLoginByUserId(
      userId,
    );
    if (!userLogin) throw new NotFoundException('User login is not found');

    console.log(userLogin);
    console.log(banInfo.isBanned);
    if (banInfo.isBanned) {
      //if isBanned = true
      //insert info about banned user of blog
      await this.usersBloggerRepository.createInfoBannedUserOfBlog(
        userId,
        banInfo.blogId,
        banInfo.banReason,
        banInfo.isBanned,
      );
    } else {
      //delete info
      await this.usersBloggerRepository.deleteInfoBannedUserOfBlog(
        userId,
        banInfo.blogId,
      );
    }
    return;
  }
}
