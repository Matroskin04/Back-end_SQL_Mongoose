import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ARTokensAndUserIdType } from '../dto/auth.dto.service';
import { ObjectId } from 'mongodb';
import { UsersSAQueryRepository } from '../../../users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { JwtService } from '../../../jwt/jwt.service';

export class LoginUserCommand {
  constructor(public userId: ObjectId) {}
}

@CommandHandler(LoginUserCommand)
export class LoginUserUseCase implements ICommandHandler<LoginUserCommand> {
  constructor(
    protected jwtService: JwtService,
    protected usersQueryRepository: UsersSAQueryRepository,
  ) {}
  async execute(
    command: LoginUserCommand,
  ): Promise<ARTokensAndUserIdType | null> {
    const { userId } = command;
    const user = await this.usersQueryRepository.getUserByUserId(userId);
    if (!user) {
      //Если user не существует, значит payload неверный
      return null;
    }

    const accessToken = this.jwtService.createAccessJwtToken(userId.toString());
    const refreshToken = this.jwtService.createRefreshJwtToken(
      userId.toString(),
      null,
    );

    return {
      accessToken,
      refreshToken,
      userId: user._id,
    };
  }
}
