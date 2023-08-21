import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';
import { CryptoAdapter } from '../../../../infrastructure/adapters/crypto.adapter';
import { EmailManager } from '../../../../infrastructure/managers/email-manager';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../../users/domain/users.entity';
import { UserModelType } from '../../../users/domain/users.db.types';
import { EmailConfirmationPublicRepository } from '../../../users/public/infrastructure/subrepositories/email-confirmation.public.repository';
import { PasswordRecoveryPublicRepository } from '../../../users/public/infrastructure/subrepositories/password-recovery.public.repository';
import { BanInfoPublicRepository } from '../../../users/public/infrastructure/subrepositories/ban-info.public.repository';
import { UsersPublicRepositorySQL } from '../../../users/public/infrastructure/repository/users.public.repository-sql';

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
    @InjectModel(User.name)
    private UserModel: UserModelType,
    protected cryptoAdapter: CryptoAdapter,
    protected emailManager: EmailManager,
    protected usersPublicRepository: UsersPublicRepositorySQL,
    protected emailConfirmationPublicRepository: EmailConfirmationPublicRepository,
    protected passwordRecoveryPublicRepository: PasswordRecoveryPublicRepository,
    protected banInfoPublicRepository: BanInfoPublicRepository,
  ) {}

  async execute(command: RegisterUserCommand): Promise<void> {
    const { email, login, password } = command;

    const passwordHash = await this.cryptoAdapter._generateHash(password);

    const userId = uuidv4();
    await this.usersPublicRepository.createUser(
      userId,
      login,
      email,
      passwordHash,
    );
    const confirmationCode = uuidv4();
    await this.emailConfirmationPublicRepository.createEmailConfirmationInfo(
      confirmationCode,
      add(new Date(), { hours: 5, seconds: 20 }),
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
