import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import jwt from 'jsonwebtoken';
import { UsersQueryRepository } from '../../infrastructure/query.repository/users.query.repository';
import { BannedUserModelType } from '../../banned/banned-sa-users/domain/users-banned.db.types';
import { User } from '../../domain/users.entity';
import { UserModelType } from '../../domain/users.db.types';
@Injectable()
export class UsersSaService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}
  //SQL

  async getUserIdByAccessToken(token: string): Promise<null | string> {
    try {
      const decode = jwt.verify(
        token,
        process.env.PRIVATE_KEY_ACCESS_TOKEN!,
      ) as {
        userId: string;
      };
      return decode.userId;
    } catch (err) {
      return null;
    }
  }
}
