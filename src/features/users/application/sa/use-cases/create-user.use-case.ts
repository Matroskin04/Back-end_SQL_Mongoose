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
import { startTransaction } from '../../../../../infrastructure/utils/functions/db-helpers/transaction.helpers';
import { DataSource } from 'typeorm';
import { Users } from '../../../domain/users.entity';
import { UsersEmailConfirmation } from '../../../domain/users-email-confirmation.entity';
import { UsersPasswordRecovery } from '../../../domain/users-password-recovery.entity';
import { UsersBanInfo } from '../../../domain/users-ban-info.entity';

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
    private dataSource: DataSource,
  ) {}
  async execute(command: CreateUserCommand): Promise<UserViewType | false> {
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

    //start transaction
    const dataForTransaction = await startTransaction(this.dataSource, [
      Users,
      UsersEmailConfirmation,
      UsersPasswordRecovery,
      UsersBanInfo,
    ]);
    try {
      //create user
      const passwordHash = await this.cryptoAdapter._generateHash(password);
      const userId = uuidv4();
      const user = await this.usersOrmRepository.createUser(
        userId,
        login,
        email,
        passwordHash,
        dataForTransaction.repositories.Users,
      );

      await this.emailConfirmationOrmRepository.createEmailConfirmationInfo(
        uuidv4(),
        '5 hours',
        true,
        userId,
        dataForTransaction.repositories.UsersEmailConfirmation,
      );

      await this.passwordRecoveryOrmRepository.createPassRecoveryInfo(
        uuidv4(),
        userId,
        dataForTransaction.repositories.UsersPasswordRecovery,
      );
      await this.banInfoOrmRepository.createBanInfoUser(
        userId,
        dataForTransaction.repositories.UsersBanInfo,
      );

      // commit transaction now:
      await dataForTransaction.queryRunner.commitTransaction();

      return {
        id: user.id,
        login,
        email,
        createdAt: user.createdAt,
        banInfo: {
          isBanned: false,
          banDate: null,
          banReason: null,
        },
      };
    } catch (e) {
      await dataForTransaction.queryRunner.rollbackTransaction();
      console.error('Something went wrong', e);

      return false;
    } finally {
      await dataForTransaction.queryRunner.release();
    }
  }
}
