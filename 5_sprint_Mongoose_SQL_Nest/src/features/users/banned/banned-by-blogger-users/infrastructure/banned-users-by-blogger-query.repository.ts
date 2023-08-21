import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BannedUsersByBlogger } from '../domain/users-banned-by-blogger.entity';
import { BannedUsersByBloggerModelType } from '../domain/users-banned-by-blogger.db.types';
import { BannedUserByBloggerType } from './banned-users-by-blogger.types.query.repository';

Injectable();
export class BannedUsersByBloggerQueryRepository {
  constructor(
    @InjectModel(BannedUsersByBlogger.name)
    private BannedUsersByBloggerModel: BannedUsersByBloggerModelType,
  ) {}
  async getBannedUserByBlogger(
    userId: string,
    blogId: string,
  ): Promise<null | BannedUserByBloggerType> {
    const bannedUser = await this.BannedUsersByBloggerModel.findOne({
      userId,
      blogId,
    }).lean();
    return bannedUser;
  }
}
