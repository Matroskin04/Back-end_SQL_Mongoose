import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersQueryRepository } from '../../../users/infrastructure/SQL/query.repository/users.query.repository';
import { v4 as uuidv4 } from 'uuid';
import { EmailManager } from '../../../../infrastructure/managers/email-manager';
import { PasswordRecoveryPublicRepository } from '../../../users/infrastructure/SQL/subrepository/password-recovery.public.repository';
import { UsersOrmQueryRepository } from '../../../users/infrastructure/typeORM/query.repository/users-orm.query.repository';
import { PasswordRecoveryOrmRepository } from '../../../users/infrastructure/typeORM/subrepository/password-recovery-orm.public.repository';

export class SendEmailPassRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendEmailPassRecoveryCommand)
export class SendEmailPassRecoveryUseCase
  implements ICommandHandler<SendEmailPassRecoveryCommand>
{
  constructor(
    protected passwordRecoveryOrmRepository: PasswordRecoveryOrmRepository,
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
    protected emailManager: EmailManager,
  ) {}

  async execute(command: SendEmailPassRecoveryCommand): Promise<void> {
    const { email } = command;
    const user =
      await this.usersOrmQueryRepository.getUserBanInfoByLoginOrEmail(email);
    if (!user) return;

    const newCode = uuidv4();
    const result =
      await this.passwordRecoveryOrmRepository.updateCodePasswordRecovery(
        user.id,
        newCode,
      );
    if (!result) throw new Error('Updating password recovery code is failed');

    this.emailManager.sendEmailPasswordRecovery(email, newCode);

    return;
  }
}
