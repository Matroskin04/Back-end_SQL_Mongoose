import { BannedUsersByBloggerInstance } from './users-blogger.types.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BannedUsersByBlogger } from '../../../banned/banned-by-blogger-users/domain/users-banned-by-blogger.entity';
import { BannedUsersByBloggerModelType } from '../../../banned/banned-by-blogger-users/domain/users-banned-by-blogger.db.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersBloggerRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(BannedUsersByBlogger.name)
    private BannedUsersByBloggerModel: BannedUsersByBloggerModelType,
  ) {}

  //SQL
  async createInfoBannedUserOfBlog(
    userId: string,
    blogId: string,
    banReason: string,
    banStatus: boolean,
  ): Promise<void> {
    const result = await this.dataSource.query(
      `
    INSERT INTO public."banned_users_of_blog"(
        "userId", "blogId", "isBanned", "banReason")
        VALUES ($1, $2, $3, $4);`,
      [userId, blogId, banStatus, banReason],
    );
    return;
  }

  async deleteInfoBannedUserOfBlog(
    userId: string,
    blogId: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    DELETE FROM public."banned_users_of_blog" 
        WHERE "userId" = $1 AND "blogId" = $2;`,
      [userId, blogId],
    );
    console.log(result);
    return result[1] === 1;
  }

  //MONGO
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
