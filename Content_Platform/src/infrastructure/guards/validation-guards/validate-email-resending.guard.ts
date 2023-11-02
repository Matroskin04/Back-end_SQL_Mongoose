import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { UsersQueryRepository } from '../../../features/users/infrastructure/SQL/query.repository/users.query.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersOrmQueryRepository } from '../../../features/users/infrastructure/typeORM/query.repository/users-orm.query.repository';

@Injectable()
export class ValidateEmailResendingGuard implements CanActivate {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const emailConfirmationInfo =
      await this.usersOrmQueryRepository.getEmailConfirmationInfoByEmail(
        request.body.email,
      );

    if (!emailConfirmationInfo) {
      throw new BadRequestException([
        {
          message: `This email has not been registered yet`,
          field: 'email',
        },
      ]);
    }
    if (emailConfirmationInfo.isConfirmed) {
      throw new BadRequestException([
        {
          message: `Email is already confirmed`,
          field: 'email',
        },
      ]);
    }
    request.userId = emailConfirmationInfo.userId;

    return true;
  }
}
