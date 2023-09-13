import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginUserDTO } from '../dto/login-user.dto';
import { UsersQueryRepository } from '../../../users/infrastructure/SQL/query.repository/users.query.repository';
import { JwtAdapter } from '../../../../infrastructure/adapters/jwt.adapter';

export class LoginUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    protected jwtService: JwtAdapter,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}
  async execute(command: LoginUserCommand): Promise<LoginUserDTO | null> {
    const { userId } = command;
    const user = await this.usersQueryRepository.doesUserExistById(userId);
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
