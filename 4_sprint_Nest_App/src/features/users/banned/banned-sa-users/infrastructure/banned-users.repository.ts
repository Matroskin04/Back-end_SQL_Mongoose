import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BannedUserBySA } from '../domain/users-banned.entity';
import { BannedUserModelType } from '../domain/users-banned.db.types';
import {
  BannedUserInstanceType,
  UserInstanceType,
} from '../../../super-admin/infrastructure/repository/users-sa.types.repositories';

@Injectable()
export class BannedUsersRepository {
  constructor(
    @InjectModel(BannedUserBySA.name)
    private BannedUserModel: BannedUserModelType,
  ) {}

  async save(bannedUser: BannedUserInstanceType): Promise<void> {
    await bannedUser.save();
    return;
  }

  async deleteBannedUserById(userId: string): Promise<boolean> {
    const result = await this.BannedUserModel.deleteOne({ userId });
    return result.deletedCount === 1;
  }
}
