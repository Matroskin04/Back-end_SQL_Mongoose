import { Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { UsersQueryRepository } from '../../infrastructure/query.repository/users.query.repository';

@Injectable()
export class UsersSaService {
  constructor(protected usersQueryRepository: UsersQueryRepository) {}
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
