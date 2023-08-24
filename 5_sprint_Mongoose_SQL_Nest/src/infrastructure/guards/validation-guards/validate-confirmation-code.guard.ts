import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { UsersSAQueryRepository } from '../../../features/users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable() //todo validator Constraints
export class ValidateConfirmationCodeGuard implements CanActivate {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected usersQueryRepository: UsersSAQueryRepository,
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

    const emailConfirmationInfo = await this.dataSource.query(
      `
    SELECT "userId", "isConfirmed", "expirationDate" FROM public."users_email_confirmation"
        WHERE "confirmationCode" = $1`,
      [request.body.code],
    );

    if (!emailConfirmationInfo[0]) {
      throw new BadRequestException([
        { message: 'Code is incorrect', field: 'code' },
      ]); //Code is incorrect
    }

    if (+new Date(emailConfirmationInfo[0].expirationDate) < +new Date()) {
      throw new BadRequestException([
        { message: 'Code is already expired', field: 'code' },
      ]); //Code is already expired
    }
    if (emailConfirmationInfo[0].isConfirmed) {
      throw new BadRequestException([
        { message: 'Code is already been applied', field: 'code' },
      ]); //Code is already been applied
    }
    request.userId = emailConfirmationInfo[0].userId;

    return true;
  }
}
