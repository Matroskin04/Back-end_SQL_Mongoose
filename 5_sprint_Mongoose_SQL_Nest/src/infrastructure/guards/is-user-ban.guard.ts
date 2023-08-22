import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersSAQueryRepository } from '../../features/users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { UsersPublicQueryRepository } from '../../features/users/public/infrastructure/query.repository/users-public.query.repository';

@Injectable()
export class BlogOwnerByIdGuard implements CanActivate {
  constructor(
    protected usersPublicQueryRepository: UsersPublicQueryRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    if (!request.body || !request.body.loginOrEmail)
      throw new Error('Login must be passed');

    const user =
      await this.usersPublicQueryRepository.getUserBanlInfoByLoginOrEmail(
        request.body.loginOrEmail,
      );
    if (!user) throw new UnauthorizedException('User is not found');
    if (user.isBanned) throw new UnauthorizedException('User is banned'); //Если забанен - то Unauthorized

    return true;
  }
}
