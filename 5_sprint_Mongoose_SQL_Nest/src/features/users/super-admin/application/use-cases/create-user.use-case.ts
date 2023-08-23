import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserViewType } from '../../infrastructure/query.repository/users-sa.types.query.repository';
import { BadRequestException } from '@nestjs/common';
import { createBodyErrorBadRequest } from '../../../../../infrastructure/utils/functions/create-error-bad-request.function';
import { UserInfoType } from '../dto/user-info.dto';
import { UsersPublicQueryRepository } from '../../../public/infrastructure/query.repository/users-public.query.repository';
import { CryptoAdapter } from '../../../../../infrastructure/adapters/crypto.adapter';
import { UsersPublicRepository } from '../../../public/infrastructure/repository/users-public.repository';
import { v4 as uuidv4 } from 'uuid';
import { UsersSAQueryRepository } from '../../infrastructure/query.repository/users-sa.query.repository';
import { EmailConfirmationPublicRepository } from '../../../public/infrastructure/subrepositories/email-confirmation.public.repository';
import { PasswordRecoveryPublicRepository } from '../../../public/infrastructure/subrepositories/password-recovery.public.repository';
import { BanInfoPublicRepository } from '../../../public/infrastructure/subrepositories/ban-info.public.repository';

export class CreateUserCommand {
  constructor(public inputUserDTO: UserInfoType) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
  constructor(
    protected usersPublicQueryRepository: UsersPublicQueryRepository,
    protected cryptoAdapter: CryptoAdapter,
    protected usersPublicRepository: UsersPublicRepository, //todo обращаться из flow SA в репо Public?
    protected usersSAQueryRepository: UsersSAQueryRepository,
    protected emailConfirmationPublicRepository: EmailConfirmationPublicRepository,
    protected passwordRecoveryPublicRepository: PasswordRecoveryPublicRepository,
    protected banInfoPublicRepository: BanInfoPublicRepository,
  ) {}
  async execute(command: CreateUserCommand): Promise<UserViewType> {
    const { login, email, password } = command.inputUserDTO;

    //Проверяем, есть ли пользователь с такими данными
    const userByEmail =
      await this.usersPublicQueryRepository.getUserPassEmailInfoByLoginOrEmail(
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
      await this.usersPublicQueryRepository.getUserPassEmailInfoByLoginOrEmail(
        login,
      );
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
    await this.usersPublicRepository.createUser(
      userId,
      login,
      email,
      passwordHash,
    );

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
    const user = await this.usersSAQueryRepository.getUserWithBanInfoById(
      userId,
    );
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
