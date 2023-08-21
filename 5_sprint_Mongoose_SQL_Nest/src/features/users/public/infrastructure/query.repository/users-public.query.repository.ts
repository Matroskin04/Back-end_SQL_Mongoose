import { ObjectId } from 'mongodb';
import { UserDBType, UserModelType } from '../../../domain/users.db.types';
import { InjectModel } from '@nestjs/mongoose';
import { UsersInfoPublicType } from './users-public.types.query.repository';
import { Injectable } from '@nestjs/common';
import { User } from '../../../domain/users.entity';

@Injectable()
export class UsersPublicQueryRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}
  async getUserInfoById(userId: ObjectId): Promise<null | UsersInfoPublicType> {
    const user = await this.UserModel.findOne({ _id: userId });
    if (!user) return null;

    return {
      email: user.email,
      login: user.login,
      userId: user._id.toString(),
    };
  }

  async getUserByRecoveryCode(
    recoveryCode: string,
  ): Promise<UserDBType | null> {
    return this.UserModel.findOne({
      'passwordRecovery.confirmationCode': recoveryCode,
    });
  }
}
