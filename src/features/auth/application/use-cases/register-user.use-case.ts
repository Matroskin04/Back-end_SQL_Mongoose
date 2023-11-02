import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CryptoAdapter } from '../../../../infrastructure/adapters/crypto.adapter';
import { EmailManager } from '../../../../infrastructure/managers/email-manager';
import { UsersOrmRepository } from '../../../users/infrastructure/typeORM/repository/users-orm.repository';
import { EmailConfirmationOrmRepository } from '../../../users/infrastructure/typeORM/subrepository/email-confirmation-orm.public.repository';
import { PasswordRecoveryOrmRepository } from '../../../users/infrastructure/typeORM/subrepository/password-recovery-orm.public.repository';
import { BanInfoOrmRepository } from '../../../users/infrastructure/typeORM/subrepository/ban-info-orm.public.repository';
import { DataSource } from 'typeorm';
import { startTransaction } from '../../../../infrastructure/utils/functions/db-helpers/transaction.helpers';
import { Users } from '../../../users/domain/users.entity';
import { UsersEmailConfirmation } from '../../../users/domain/users-email-confirmation.entity';
import { UsersPasswordRecovery } from '../../../users/domain/users-password-recovery.entity';
import { UsersBanInfo } from '../../../users/domain/users-ban-info.entity';
import { InjectDataSource } from '@nestjs/typeorm';

export class RegisterUserCommand {
  constructor(
    public email: string,
    public login: string,
    public password: string,
  ) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase
  implements ICommandHandler<RegisterUserCommand>
{
  constructor(
    protected cryptoAdapter: CryptoAdapter,
    protected emailManager: EmailManager,
    protected usersOrmRepository: UsersOrmRepository,
    protected emailConfirmationPublicRepository: EmailConfirmationOrmRepository,
    protected passwordRecoveryPublicRepository: PasswordRecoveryOrmRepository,
    protected banInfoPublicRepository: BanInfoOrmRepository,
    @InjectDataSource() protected dataSource: DataSource,
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const { email, login, password } = command;
    const confirmationCode = uuidv4();

    const passwordHash = await this.cryptoAdapter._generateHash(password);

    const userId = uuidv4();

    //start transaction
    const dataForTransaction = await startTransaction(this.dataSource, [
      Users,
      UsersEmailConfirmation,
      UsersPasswordRecovery,
      UsersBanInfo,
    ]);
    try {
      await this.usersOrmRepository.createUser(
        userId,
        login,
        email,
        passwordHash,
        dataForTransaction.repositories.Users,
      );

      await this.emailConfirmationPublicRepository.createEmailConfirmationInfo(
        confirmationCode,
        '5 hours',
        false,
        userId,
        dataForTransaction.repositories.UsersEmailConfirmation,
      );

      await this.passwordRecoveryPublicRepository.createPassRecoveryInfo(
        uuidv4(),
        userId,
        dataForTransaction.repositories.UsersPasswordRecovery,
      );
      await this.banInfoPublicRepository.createBanInfoUser(
        userId,
        dataForTransaction.repositories.UsersBanInfo,
      );

      // commit transaction now:
      await dataForTransaction.queryRunner.commitTransaction();
      this.emailManager.sendEmailConfirmationMessage(email, confirmationCode);
    } catch (err) {
      await dataForTransaction.queryRunner.rollbackTransaction();
      console.error('Register of new user failed:', err);
    } finally {
      // you need to release query runner which is manually created:
      await dataForTransaction.queryRunner.release();
    }
  }
}
