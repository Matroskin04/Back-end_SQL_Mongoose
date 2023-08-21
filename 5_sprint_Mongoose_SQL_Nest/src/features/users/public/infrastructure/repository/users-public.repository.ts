import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UserInstanceType } from '../../../super-admin/infrastructure/repository/users-sa.types.repositories';
import { User } from '../../../domain/users.entity';
import { UserModelType } from '../../../domain/users.db.types';

@Injectable() //todo для чего этот декоратор
export class UsersPublicRepository {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
  ) {}
  async updatePassword(
    newPasswordHash: string,
    _id: ObjectId,
  ): Promise<boolean> {
    const result = await this.UserModel.updateOne(
      { _id },
      { $set: { passwordHash: newPasswordHash } },
    );
    return result.modifiedCount === 1;
  }

  async save(user: UserInstanceType): Promise<void> {
    await user.save();
    return;
  }
}
