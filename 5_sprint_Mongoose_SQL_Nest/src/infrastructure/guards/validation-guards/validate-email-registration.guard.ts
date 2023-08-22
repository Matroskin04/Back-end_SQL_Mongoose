import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { UsersSAQueryRepository } from '../../../features/users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { UsersPublicQueryRepository } from '../../../features/users/public/infrastructure/query.repository/users-public.query.repository';

@Injectable()
export class ValidateEmailRegistrationGuard implements CanActivate {
  constructor(
    protected usersPublicQueryRepository: UsersPublicQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userInfoByLogin =
      await this.usersPublicQueryRepository.getUserPassEmailInfoByLoginOrEmail(
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

    const userInfoByEmail =
      await this.usersPublicQueryRepository.getUserPassEmailInfoByLoginOrEmail(
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
