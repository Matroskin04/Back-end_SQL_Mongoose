import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { UsersOrmQueryRepository } from '../../../features/users/infrastructure/typeORM/query.repository/users-orm.query.repository';

@Injectable()
export class ValidateEmailRegistrationGuard implements CanActivate {
  constructor(protected usersOrmQueryRepository: UsersOrmQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const doesExistByLogin =
      await this.usersOrmQueryRepository.doesUserExistByLoginEmail(
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
      await this.usersOrmQueryRepository.doesUserExistByLoginEmail(
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
