import * as bcrypt from 'bcryptjs';
import { UsersQueryRepository } from '../../users/infrastructure/query.repository/users.query.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(protected usersQueryRepository: UsersQueryRepository) {}

  //SQL
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<any | false> {
    //todo тип
    const user =
      await this.usersQueryRepository.getUserPassEmailInfoByLoginOrEmail(
        loginOrEmail,
      );
    if (!user || !user.isConfirmed) {
      return false;
    }

    return (await bcrypt.compare(password, user.passwordHash)) ? user : false;
  }

  //MONGO
  /*  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<UserDBServiceType | false> {
    const user = await this.usersQueryRepository.getUserByLoginOrEmail(
      loginOrEmail,
    );
    if (!user || !user.emailConfirmation.isConfirmed) {
      return false;
    }

    return (await bcrypt.compare(password, user.passwordHash)) ? user : false;
  }*/
}
