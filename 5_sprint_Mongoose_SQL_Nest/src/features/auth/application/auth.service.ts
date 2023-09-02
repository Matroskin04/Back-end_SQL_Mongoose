import * as bcrypt from 'bcryptjs';
import { UsersQueryRepository } from '../../users/infrastructure/query.repository/users.query.repository';
import { Injectable } from '@nestjs/common';
import { ValidateUserDTO } from './dto/validate-user.dto';

@Injectable()
export class AuthService {
  constructor(protected usersQueryRepository: UsersQueryRepository) {}

  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<ValidateUserDTO | false> {
    //todo UserWithPassInfoType?)
    const user =
      await this.usersQueryRepository.getUserPassEmailInfoByLoginOrEmail(
        loginOrEmail,
      );
    if (!user || !user.isConfirmed) {
      return false;
    }

    return (await bcrypt.compare(password, user.passwordHash)) ? user : false;
  }
}
