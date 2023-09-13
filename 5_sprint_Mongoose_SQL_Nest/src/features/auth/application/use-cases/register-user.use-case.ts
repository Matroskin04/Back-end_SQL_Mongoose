import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { CryptoAdapter } from '../../../../infrastructure/adapters/crypto.adapter';
import { EmailManager } from '../../../../infrastructure/managers/email-manager';
import { EmailConfirmationPublicRepository } from '../../../users/infrastructure/SQL/subrepository/email-confirmation.public.repository';
import { PasswordRecoveryPublicRepository } from '../../../users/infrastructure/SQL/subrepository/password-recovery.public.repository';
import { BanInfoPublicRepository } from '../../../users/infrastructure/SQL/subrepository/ban-info.public.repository';
import { UsersRepository } from '../../../users/infrastructure/SQL/repository/users.repository';
import { UsersOrmRepository } from '../../../users/infrastructure/typeORM/repository/users-orm.repository';
import { EmailConfirmationOrmRepository } from '../../../users/infrastructure/typeORM/subrepository/email-confirmation-orm.public.repository';
import { PasswordRecoveryOrmRepository } from '../../../users/infrastructure/typeORM/subrepository/password-recovery-orm.public.repository';
import { BanInfoOrmRepository } from '../../../users/infrastructure/typeORM/subrepository/ban-info-orm.public.repository';

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
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const { email, login, password } = command;

    const passwordHash = await this.cryptoAdapter._generateHash(password);

    const userId = uuidv4();
    await this.usersOrmRepository.createUser(
      userId,
      login,
      email,
      passwordHash,
    );
    const confirmationCode = uuidv4();

    await this.emailConfirmationPublicRepository.createEmailConfirmationInfo(
      confirmationCode,
      '5 hours',
      false,
      userId,
    );

    await this.passwordRecoveryPublicRepository.createPassRecoveryInfo(
      uuidv4(),
      userId,
    );
    await this.banInfoPublicRepository.createBanInfoUser(userId);

    this.emailManager.sendEmailConfirmationMessage(email, confirmationCode);
    return;
  }
}
