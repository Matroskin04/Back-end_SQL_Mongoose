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

@Injectable()
@SkipThrottle()
export class UsersBloggerService {
  constructor(
    @InjectModel(BannedUsersByBlogger.name)
    private BannedUsersByBloggerModel: BannedUsersByBloggerModelType,
    protected usersBloggerRepository: UsersBloggerRepository,
    protected usersBloggerQueryRepository: UsersBloggerQueryRepository,
  ) {}

  async updateBanInfoOfUser(
    userId: string,
    banInfo: BanInfoBloggerType,
  ): Promise<void> {
    const userLogin = await this.usersBloggerQueryRepository.getUserLoginById(
      new ObjectId(userId),
    );
    if (!userLogin) throw new NotFoundException('User login is not found');

    const bannedUsersByBlogger =
      await this.usersBloggerRepository.getBannedUsersByBlogIdInstance(
        banInfo.blogId,
        userId,
      );

    if (banInfo.isBanned) {
      //creates banned user info for DB
      const bannedUserInfo = {
        userId,
        login: userLogin,
        banInfo: {
          banReason: banInfo.banReason,
          banDate: new Date().toISOString(),
          isBanned: banInfo.isBanned,
        },
      };

      //check of existing info about banned users
      if (bannedUsersByBlogger) return;
      //   throw new BadRequestException([
      //     {
      //       message: `User is already banned`,
      //       field: 'isBanned',
      //     },
      //   ]);

      //if info doesn't exist, creates doc
      const newBannedUsersByBlogger =
        this.BannedUsersByBloggerModel.createInstance(
          banInfo.blogId,
          bannedUserInfo,
          this.BannedUsersByBloggerModel,
        );
      await this.usersBloggerRepository.save(newBannedUsersByBlogger);
      return;
    }

    //!!!if banInfo.isBanned === false:!!!
    //check of existing info about banned users
    if (!bannedUsersByBlogger) return;
    // throw new BadRequestException([
    //   {
    //     message: `User is already unbanned`,
    //     field: 'isBanned',
    //   },
    // ]);

    //if info exist, delete this doc
    const result = await this.usersBloggerRepository.deleteBannedUserFromList(
      banInfo.blogId,
      userId,
    );
    if (!result) throw new Error('Deletion failed');
    return;
  }
}
