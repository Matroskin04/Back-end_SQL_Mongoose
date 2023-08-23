import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserInstanceType } from './users-sa.types.repositories';
import { User } from '../../../domain/users.entity';
import { UserModelType } from '../../../domain/users.db.types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersSARepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  //SQL
  async deleteUserById(userId: string): Promise<boolean> {
    //todo удалять каскадом или пометку 'isDeleted'?
    const result = await this.dataSource.query(
      `
    UPDATE public."users"
        SET "isDeleted" = true
        WHERE "id" = $1`,
      [userId],
    );
    return result[1] === 1;
  }

  async updateBanInfoOfUser(
    userId: string,
    isBanned: boolean,
    banReason: string,
  ): Promise<boolean> {
    const result = await this.dataSource.query(
      `
    UPDATE public."users_ban_info" 
      SET "isBanned" = $1, "banReason" = $2, "banDate" = now()
      WHERE "userId" = $3`,
      [isBanned, banReason, userId],
    );
    return result[1] === 1;
  }

  //MONGO
  async getUserById(userId: ObjectId): Promise<null | UserInstanceType> {
    const user = await this.UserModel.findOne({ _id: userId });
    return user;
  }

  async save(user: UserInstanceType): Promise<void> {
    await user.save();
    return;
  }
}
