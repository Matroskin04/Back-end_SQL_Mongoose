import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserWithPassEmailInfoDto } from '../dto/user-with-pass-email-info.dto';
import * as bcrypt from 'bcryptjs';
import { UsersQueryRepository } from '../../../users/infrastructure/SQL/query.repository/users.query.repository';
import { UsersOrmQueryRepository } from '../../../users/infrastructure/typeORM/query.repository/users-orm.query.repository';

export class ValidateUserCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(ValidateUserCommand)
export class ValidateUserUseCase
  implements ICommandHandler<ValidateUserCommand>
{
  constructor(protected usersOrmQueryRepository: UsersOrmQueryRepository) {}

  async execute(
    command: ValidateUserCommand,
  ): Promise<UserWithPassEmailInfoDto | false> {
    const { loginOrEmail, password } = command;

    const user =
      await this.usersOrmQueryRepository.getUserPassEmailInfoByLoginOrEmail(
        loginOrEmail,
      );
    if (!user || !user.isConfirmed) {
      return false;
    }

    return (await bcrypt.compare(password, user.passwordHash)) ? user : false;
  }
}
