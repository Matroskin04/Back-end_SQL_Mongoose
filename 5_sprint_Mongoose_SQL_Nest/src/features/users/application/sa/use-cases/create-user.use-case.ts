import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { createBodyErrorBadRequest } from '../../../../../infrastructure/utils/functions/create-error-bad-request.function';
import { UserInfoType } from '../dto/user-info.dto';
import { CryptoAdapter } from '../../../../../infrastructure/adapters/crypto.adapter';
import { v4 as uuidv4 } from 'uuid';
import { UserViewType } from '../../../infrastructure/SQL/query.repository/users.output.types.query.repository';
import { UsersOrmQueryRepository } from '../../../infrastructure/typeORM/query.repository/users-orm.query.repository';
import { UsersOrmRepository } from '../../../infrastructure/typeORM/repository/users-orm.repository';
import { EmailConfirmationOrmRepository } from '../../../infrastructure/typeORM/subrepository/email-confirmation-orm.public.repository';
import { PasswordRecoveryOrmRepository } from '../../../infrastructure/typeORM/subrepository/password-recovery-orm.public.repository';
import { BanInfoOrmRepository } from '../../../infrastructure/typeORM/subrepository/ban-info-orm.public.repository';

export class CreateUserCommand {
  constructor(public inputUserDTO: UserInfoType) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
    protected cryptoAdapter: CryptoAdapter,
    protected usersOrmRepository: UsersOrmRepository,
    protected emailConfirmationOrmRepository: EmailConfirmationOrmRepository,
    protected passwordRecoveryOrmRepository: PasswordRecoveryOrmRepository,
    protected banInfoOrmRepository: BanInfoOrmRepository,
  ) {}
  async execute(command: CreateUserCommand): Promise<UserViewType> {
    const { login, email, password } = command.inputUserDTO;

    //Проверяем, есть ли пользователь с такими данными
    const userByEmail =
      await this.usersOrmQueryRepository.doesUserExistByLoginOrEmail(email);
    if (userByEmail) {
      throw new BadRequestException(
        createBodyErrorBadRequest(
          'User with such email already exists',
          'email',
        ),
      );
    }

    const userByLogin =
      await this.usersOrmQueryRepository.doesUserExistByLoginOrEmail(login);
    if (userByLogin)
      throw new BadRequestException(
        createBodyErrorBadRequest(
          'User with such login already exists',
          'login',
        ),
      );

    //создаем юзера
    const passwordHash = await this.cryptoAdapter._generateHash(password);
    const userId = uuidv4();
    const user = await this.usersOrmRepository.createUser(
      userId,
      login,
      email,
      passwordHash,
    );

    await this.emailConfirmationOrmRepository.createEmailConfirmationInfo(
      uuidv4(),
      '5 hours',
      true,
      userId,
    );

    await this.passwordRecoveryOrmRepository.createPassRecoveryInfo(
      uuidv4(),
      userId,
    );
    await this.banInfoOrmRepository.createBanInfoUser(userId);

    return {
      id: user.id,
      login,
      email,
      createdAt: user.createdAt,
      // banInfo: {
      //   isBanned: false,
      //   banDate: null,
      //   banReason: null,
      // },
    };
  }
}
