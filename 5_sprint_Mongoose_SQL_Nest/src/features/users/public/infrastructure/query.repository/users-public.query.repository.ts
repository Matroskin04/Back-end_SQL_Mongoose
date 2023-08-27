import { ObjectId } from 'mongodb';
import { UserDBTypeMongo, UserModelType } from '../../../domain/users.db.types';
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
    return result[0];
  }

  async getUserPassEmailInfoByLoginOrEmail(
    logOrEmail: string,
  ): Promise<any | null> {
    //todo тип
    const userInfo = await this.dataSource.query(
      `
    SELECT u."id", u."login", u."email", u."passwordHash", ec."isConfirmed" 
      FROM public."users" AS u
      JOIN public."users_email_confirmation" AS ec 
      ON u."id" = ec."userId"
      WHERE u."login" = $1 OR u."email" = $1`,
      [logOrEmail],
    );
    if (userInfo.length === 0) return null;
    return userInfo[0];
  }

  async getUserBanInfoByLoginOrEmail(logOrEmail: string): Promise<any | null> {
    //todo тип
    const userInfo = await this.dataSource.query(
      `
    SELECT u."id", u."login", u."email", bi."isBanned" 
      FROM public."users" AS u
      JOIN public."users_ban_info" AS bi
      ON u."id" = bi."userId"
      WHERE u."login" = $1 OR u."email" = $1`,
      [logOrEmail],
    );
    if (userInfo.length === 0) return null;
    return userInfo[0];
  }

  async getUserByRecoveryCode(recoveryCode: string): Promise<any> {
    //todo тип
    const result = await this.dataSource.query(
      `
    SELECT u."id", pc."expirationDate", pc."confirmationCode"
      FROM public."users" AS u
      JOIN public."users_password_recovery" AS pc
        ON u."id" = pc."userId"
        WHERE "confirmationCode" = $1`,
      [recoveryCode],
    );
    if (!result[0]) return null;
    return result[0];
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

  /*  async getUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserDBType | null> {
    return this.UserModel.findOne({
      'passwordRecovery.confirmationCode': recoveryCode,
    });
  }*/
}
