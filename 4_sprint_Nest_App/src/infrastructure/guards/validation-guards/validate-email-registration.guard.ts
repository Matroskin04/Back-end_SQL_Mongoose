import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { UsersSAQueryRepository } from '../../../features/users/super-admin/infrastructure/query.repository/users-sa.query.repository';

@Injectable()
export class ValidateEmailRegistrationGuard implements CanActivate {
  constructor(protected usersQueryRepository: UsersSAQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userByLogin = await this.usersQueryRepository.getUserByLoginOrEmail(
      request.body.login,
    );
    if (userByLogin) {
      throw new BadRequestException([
        {
          message: `This ${request.body.login} is already exists, point out another`,
          field: 'login',
        },
      ]);
    }

    const userByEmail = await this.usersQueryRepository.getUserByLoginOrEmail(
      request.body.email,
    );
    if (userByEmail) {
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
