import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserWithPassEmailInfoDto } from '../dto/user-with-pass-email-info.dto';
import * as bcrypt from 'bcryptjs';
import { UsersQueryRepository } from '../../../users/infrastructure/SQL/query.repository/users.query.repository';

export class ValidateUserCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase
  implements ICommandHandler<ValidateUserCommand>
{
  constructor(protected usersQueryRepository: UsersQueryRepository) {}

  async execute(
    command: ValidateUserCommand,
  ): Promise<UserWithPassEmailInfoDto | false> {
    const { loginOrEmail, password } = command;

    const user =
      await this.usersQueryRepository.getUserPassEmailInfoByLoginOrEmail(
        loginOrEmail,
      );
    if (!user || !user.isConfirmed) {
      return false;
    }

    return (await bcrypt.compare(password, user.passwordHash)) ? user : false;
  }
}
