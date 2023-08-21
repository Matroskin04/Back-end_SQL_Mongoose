import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersSAQueryRepository } from '../../features/users/super-admin/infrastructure/query.repository/users-sa.query.repository';

@Injectable()
export class BlogOwnerByIdGuard implements CanActivate {
  constructor(protected usersQueryRepository: UsersSAQueryRepository) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.body || !request.body.loginOrEmail)
      throw new Error('Login must be passed');

    const user = await this.usersQueryRepository.getUserByLoginOrEmail(
      request.body.loginOrEmail,
    );
    if (!user) throw new UnauthorizedException('User is not found');

    if (user.banInfo.isBanned)
      throw new UnauthorizedException('User is banned'); //Если забанен - то Unauthorized
    return true;
  }
}
