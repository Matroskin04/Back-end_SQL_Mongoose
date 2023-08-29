import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { UsersQueryRepository } from '../../../features/users/infrastructure/query.repository/users.query.repository';

@Injectable()
export class ValidateEmailRegistrationGuard implements CanActivate {
  constructor(protected usersQueryRepository: UsersQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userInfoByLogin =
      await this.usersQueryRepository.getUserBanInfoByLoginOrEmail(
        request.body.login,
      );
    if (userInfoByLogin) {
      throw new BadRequestException([
        {
          message: `This ${request.body.login} is already exists, point out another`,
          field: 'login',
        },
      ]);
    }
    //todo создавать отдельный метод без banInfo (есть еще с pass/email), лишний join
    const userInfoByEmail =
      await this.usersQueryRepository.getUserBanInfoByLoginOrEmail(
        request.body.email,
      );
    if (userInfoByEmail) {
      throw new BadRequestException([
        {
          message: `This ${request.body.email} is already exists, point out another`,
          field: 'email',
        },
      ]);
    }
    return true;
  }
}
