import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { UsersSAQueryRepository } from '../../../features/users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class ValidateEmailResendingGuard implements CanActivate {
  constructor(
    @InjectDataSource() protected dataSource: DataSource,
    protected usersQueryRepository: UsersSAQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const emailConfirmationInfo = await this.dataSource.query(
      `
    SELECT ec."isConfirmed", ec."userId"
      FROM public."users" AS u
      JOIN public."users_email_confirmation" ec ON u."id" = ec."userId"
      WHERE u.email = $1`,
      [request.body.email],
    );

    if (!emailConfirmationInfo[0]) {
      throw new BadRequestException([
        {
          message: `This email has not been registered yet`,
          field: 'email',
        },
      ]);
    }
    if (emailConfirmationInfo[0].isConfirmed) {
      throw new BadRequestException([
        {
          message: `Email is already confirmed`,
          field: 'email',
        },
      ]);
    }
    request.userId = emailConfirmationInfo[0].userId;

    return true;
  }
}
