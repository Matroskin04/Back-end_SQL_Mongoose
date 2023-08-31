import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { createBodyErrorBadRequest } from '../../../../../infrastructure/utils/functions/create-error-bad-request.function';
import { UserInfoType } from '../dto/user-info.dto';
import { CryptoAdapter } from '../../../../../infrastructure/adapters/crypto.adapter';
import { UsersRepository } from '../../../infrastructure/repository/users.repository';
import { v4 as uuidv4 } from 'uuid';
import { UsersQueryRepository } from '../../../infrastructure/query.repository/users.query.repository';
import { EmailConfirmationPublicRepository } from '../../../infrastructure/subrepository/email-confirmation.public.repository';
import { PasswordRecoveryPublicRepository } from '../../../infrastructure/subrepository/password-recovery.public.repository';
import { BanInfoPublicRepository } from '../../../infrastructure/subrepository/ban-info.public.repository';
import { UserViewType } from '../../../infrastructure/query.repository/users.types.query.repository';

export class CreateUserCommand {
  constructor(public inputUserDTO: UserInfoType) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    protected usersQueryRepository: UsersQueryRepository,
    protected cryptoAdapter: CryptoAdapter,
    protected usersRepository: UsersRepository,
    protected emailConfirmationPublicRepository: EmailConfirmationPublicRepository,
    protected passwordRecoveryPublicRepository: PasswordRecoveryPublicRepository,
    protected banInfoPublicRepository: BanInfoPublicRepository,
  ) {}
  async execute(command: CreateUserCommand): Promise<UserViewType> {
    const { login, email, password } = command.inputUserDTO;

    //Проверяем, есть ли пользователь с такими данными
    const userByEmail =
      await this.usersQueryRepository.getUserPassEmailInfoByLoginOrEmail(
        //todo вынести проверку по логину и емаилу в отдельную фукнцию
        email,
      );
    if (userByEmail) {
      throw new BadRequestException(
        createBodyErrorBadRequest(
          'User with such email already exists',
          'email',
        ),
      );
    }

    const userByLogin =
      await this.usersQueryRepository.getUserPassEmailInfoByLoginOrEmail(login);
    if (userByLogin)
      throw new BadRequestException(
        createBodyErrorBadRequest(
          'User with such email already exists',
          'email',
        ),
      );

    //создаем юзера
    const passwordHash = await this.cryptoAdapter._generateHash(password);
    const userId = uuidv4();
    await this.usersRepository.createUser(userId, login, email, passwordHash);

    await this.emailConfirmationPublicRepository.createEmailConfirmationInfo(
      uuidv4(),
      '5 hours',
      true,
      userId,
    );

    await this.passwordRecoveryPublicRepository.createPassRecoveryInfo(
      uuidv4(),
      userId,
    );
    await this.banInfoPublicRepository.createBanInfoUser(userId);

    //Получаем информацию о user для вывода
    const user = await this.usersQueryRepository.getUserWithBanInfoById(userId);
    if (!user) throw new Error('Created user is not found');

    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        isBanned: user.isBanned,
        banDate: user.banDate,
        banReason: user.banReason,
      },
    };
  }
}
