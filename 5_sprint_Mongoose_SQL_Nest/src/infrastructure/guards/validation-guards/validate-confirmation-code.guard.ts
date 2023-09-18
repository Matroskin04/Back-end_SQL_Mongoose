import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UsersOrmQueryRepository } from '../../../features/users/infrastructure/typeORM/query.repository/users-orm.query.repository';
import { UsersQueryRepository } from '../../../features/users/infrastructure/SQL/query.repository/users.query.repository';

@Injectable() //todo validator Constraints
export class ValidateConfirmationCodeGuard implements CanActivate {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    //todo отдельный метод
    if (
      !request.body.code.match(
        /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
      )
    )
      throw new BadRequestException([
        { message: 'Code is incorrect', field: 'code' },
      ]); //Code is incorrect form

    const emailConfirmationInfo =
      await this.usersOrmQueryRepository.getEmailConfirmationInfoByCode(
        request.body.code,
      );

    if (!emailConfirmationInfo) {
      throw new BadRequestException([
        { message: 'Code is incorrect', field: 'code' },
      ]); //Code is incorrect
    }

    if (+new Date(emailConfirmationInfo.expirationDate) < +new Date()) {
      throw new BadRequestException([
        { message: 'Code is already expired', field: 'code' },
      ]); //Code is already expired
    }
    if (emailConfirmationInfo.isConfirmed) {
      throw new BadRequestException([
        { message: 'Code is already been applied', field: 'code' },
      ]); //Code is already been applied
    }
    request.userId = emailConfirmationInfo.userId;

    return true;
  }
}
