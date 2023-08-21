import {
  Injectable,
  CanActivate,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { UsersSAQueryRepository } from '../../../features/users/super-admin/infrastructure/query.repository/users-sa.query.repository';

@Injectable()
export class ValidateEmailResendingGuard implements CanActivate {
  constructor(protected usersQueryRepository: UsersSAQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const user = await this.usersQueryRepository.getUserByLoginOrEmail(
      request.body.email,
    );
    if (!user) {
      throw new BadRequestException([
        {
          message: `This email has not been registered yet`,
          field: 'email',
        },
      ]);
    }
    if (user.emailConfirmation.isConfirmed) {
      throw new BadRequestException([
        {
          message: `Email is already confirmed`,
          field: 'email',
        },
      ]);
    }
    request.userId = user._id;

    return true;
  }
}
