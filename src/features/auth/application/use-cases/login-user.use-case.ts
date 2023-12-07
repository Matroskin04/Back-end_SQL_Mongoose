import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserDTO } from '../dto/login-user.dto';
import { JwtAdapter } from '../../../../infrastructure/adapters/jwt.adapter';
import { UsersOrmQueryRepository } from '../../../users/infrastructure/typeORM/query.repository/users-orm.query.repository';

export class LoginUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    protected jwtService: JwtAdapter,
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
  ) {}
  async execute(command: LoginUserCommand): Promise<LoginUserDTO | null> {
    const { userId } = command;
    const user = await this.usersOrmQueryRepository.doesUserExistById(userId);
    if (!user) {
      //If user doesn't exist - then payload is incorrect
      return null;
    }

    const accessToken = this.jwtService.createAccessJwtToken(userId);
    const refreshToken = this.jwtService.createRefreshJwtToken(userId, null);

    return {
      accessToken,
      refreshToken,
      userId,
    };
  }
}
