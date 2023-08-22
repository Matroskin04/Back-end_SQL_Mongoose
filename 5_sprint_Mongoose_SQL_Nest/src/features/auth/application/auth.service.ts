import * as bcrypt from 'bcryptjs';
import { UsersSAQueryRepository } from '../../users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { InjectModel } from '@nestjs/mongoose';
import { UserDBServiceType } from './dto/auth.dto.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../../users/domain/users.entity';
import { UserModelType } from '../../users/domain/users.db.types';
import { UsersPublicQueryRepository } from '../../users/public/infrastructure/query.repository/users-public.query.repository';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private UserModel: UserModelType,
    protected usersPublicQueryRepository: UsersPublicQueryRepository,
  ) {}

  //SQL
  async validateUser(
    loginOrEmail: string,
    password: string,
  ): Promise<any | false> {
    //todo тип
    const user =
      await this.usersPublicQueryRepository.getUserPassEmailInfoByLoginOrEmail(
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
