import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TokensAndUserIdType } from '../dto/auth.dto.service';
import { UsersQueryRepository } from '../../../users/infrastructure/query.repository/users.query.repository';
import { JwtService } from '../../../jwt/jwt.service';

export class LoginUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    protected jwtService: JwtService,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}
  async execute(
    command: LoginUserCommand,
  ): Promise<TokensAndUserIdType | null> {
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
