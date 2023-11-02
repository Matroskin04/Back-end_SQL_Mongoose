import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Users } from '../../../domain/users.entity';
import { UserIdAndDateType } from '../../SQL/repository/users.types.repository';
import { BannedUsersOfBlog } from '../../../../blogs/domain/banned-users-of-blog.entity';
import { UsersBanInfo } from '../../../domain/users-ban-info.entity';

@Injectable()
export class UsersOrmRepository {
  constructor(
    @InjectRepository(Users)
    protected usersRepository: Repository<Users>,
    @InjectRepository(BannedUsersOfBlog)
    protected bannedUsersOfBlogRepository: Repository<BannedUsersOfBlog>,
    @InjectRepository(UsersBanInfo)
    protected usersBanInfoRepository: Repository<UsersBanInfo>,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async createUser(
    userId: string,
    login: string,
    email: string,
    passwordHash: string,
    usersRepository: Repository<Users> = this.usersRepository,
  ): Promise<UserIdAndDateType> {
    const result = await usersRepository
      .createQueryBuilder()
      .insert()
      .values({ id: userId, login, email, passwordHash })
      .returning(['createdAt', 'id'])
      .execute();

    return { id: result.raw[0].id, createdAt: result.raw[0].createdAt };
  }

  async createInfoBannedUserOfBlog(
    userId: string,
    blogId: string,
    banReason: string,
    banStatus: boolean,
  ): Promise<void> {
    const result = await this.bannedUsersOfBlogRepository
      .createQueryBuilder()
      .insert()
      .values({ userId, blogId, isBanned: banStatus, banReason })
      .execute();
    return;
  }

  async updatePassword(
    newPasswordHash: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.usersRepository
      .createQueryBuilder()
      .update()
      .set({ passwordHash: newPasswordHash })
      .where('id = :userId', { userId })
      .execute();

    return result.affected === 1;
  }

  async updateBanInfoOfUser(
    userId: string,
    isBanned: boolean,
    banReason: string,
    usersBanInfoRepository: Repository<UsersBanInfo> = this
      .usersBanInfoRepository,
  ): Promise<boolean> {
    const result = await usersBanInfoRepository
      .createQueryBuilder()
      .update()
      .set({
        isBanned,
        banReason,
        banDate: isBanned ? () => 'CURRENT_TIMESTAMP' : null,
      })
      .where('userId = :userId', { userId })
      .execute();

    return result.affected === 1;
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const result = await this.usersRepository
      .createQueryBuilder()
      .update()
      .set({ isDeleted: true })
      .where('id = :userId', { userId })
      .execute();

    return result.affected === 1;
  }

  async deleteInfoBannedUserOfBlog(
    userId: string,
    blogId: string,
  ): Promise<boolean> {
    const result = await this.bannedUsersOfBlogRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId })
      .andWhere('blogId = :blogId', { blogId })
      .execute();
    return result.affected === 1;
  }
}
