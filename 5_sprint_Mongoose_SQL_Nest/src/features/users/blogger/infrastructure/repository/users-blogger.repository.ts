import { BannedUsersByBloggerInstance } from './users-blogger.types.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BannedUsersByBlogger } from '../../../banned/banned-by-blogger-users/domain/users-banned-by-blogger.entity';
import { BannedUsersByBloggerModelType } from '../../../banned/banned-by-blogger-users/domain/users-banned-by-blogger.db.types';

@Injectable()
export class UsersBloggerRepository {
  constructor(
    @InjectModel(BannedUsersByBlogger.name)
    private BannedUsersByBloggerModel: BannedUsersByBloggerModelType,
  ) {}
  async save(
    bannedUsersByBlogger: BannedUsersByBloggerInstance,
  ): Promise<void> {
    await bannedUsersByBlogger.save();
    return;
  }

  async getBannedUsersByBlogIdInstance(
    blogId: string,
    userId: string,
  ): Promise<BannedUsersByBloggerInstance | null> {
    const bannedUsers = await this.BannedUsersByBloggerModel.findOne({
      blogId,
      userId,
    });
    return bannedUsers;
  }

  async deleteBannedUserFromList(
    blogId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.BannedUsersByBloggerModel.deleteOne({
      blogId,
      userId,
    });
    return result.deletedCount === 1;
  }
}
