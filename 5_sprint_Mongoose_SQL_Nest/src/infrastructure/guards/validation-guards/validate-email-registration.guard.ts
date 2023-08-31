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

    const doesExistByLogin =
      await this.usersQueryRepository.doesUserExistByIdLoginEmail(
        request.body.login,
      );
    if (doesExistByLogin) {
      throw new BadRequestException([
        {
          message: `This ${request.body.login} is already exists, point out another`,
          field: 'login',
        },
      ]);
    }

    const doesExistByEmail =
      await this.usersQueryRepository.doesUserExistByIdLoginEmail(
        request.body.email,
      );
    if (doesExistByEmail) {
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
