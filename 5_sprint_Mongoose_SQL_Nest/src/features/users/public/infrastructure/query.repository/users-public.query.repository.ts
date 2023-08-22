import { ObjectId } from 'mongodb';
import { UserDBType, UserModelType } from '../../../domain/users.db.types';
import { InjectModel } from '@nestjs/mongoose';
import { UsersInfoPublicType } from './users-public.types.query.repository';
import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/users.entity';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersPublicQueryRepository {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}

  //SQL
  async getUserIdByConfirmationCode(confirmationCode: string): Promise<string> {
    const result = await this.dataSource.query(
      `
    SELECT "userId" FROM public."users_email_confirmation"
        WHERE "confirmationCode" = $1`,
      [confirmationCode],
    );
    return result[0].userId;
  }

  async getUserInfoById(userId: string): Promise<null | UsersInfoPublicType> {
    const result = await this.dataSource.query(
      `
    SELECT "email", "login", "id" AS "userId"
        FROM public."users"
        WHERE "id" = $1
    `,
      [userId],
    );
    console.log(result);
    return result;
  }

  //MONGO
  /*  async getUserInfoById(userId: ObjectId): Promise<null | UsersInfoPublicType> {
    const user = await this.UserModel.findOne({ _id: userId });
    if (!user) return null;

    return {
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
    };
  }*/

  async getUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserDBType | null> {
    return this.UserModel.findOne({
      'passwordRecovery.confirmationCode': recoveryCode,
    });
  }
}
