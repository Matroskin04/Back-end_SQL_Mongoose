import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDBTypeMongo } from '../../../users/domain/users.db.types';
import add from 'date-fns/add';
import { UsersSARepository } from '../../../users/super-admin/infrastructure/repository/users-sa.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/query.repository/users.query.repository';
import { v4 as uuidv4 } from 'uuid';
import { EmailManager } from '../../../../infrastructure/managers/email-manager';
import { PasswordRecoveryPublicRepository } from '../../../users/infrastructure/subrepository/password-recovery.public.repository';

export class SendEmailPassRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendEmailPassRecoveryCommand)
export class SendEmailPassRecoveryUseCase
  implements ICommandHandler<SendEmailPassRecoveryCommand>
{
  constructor(
    protected passwordRecoveryPublicRepository: PasswordRecoveryPublicRepository,
    protected usersQueryRepository: UsersQueryRepository,
    protected emailManager: EmailManager,
  ) {}

  async execute(command: SendEmailPassRecoveryCommand): Promise<void> {
    const { email } = command;
    const user = await this.usersQueryRepository.getUserBanInfoByLoginOrEmail(
      email,
    );
    if (!user) return;

    const newCode = uuidv4();
    const result =
      await this.passwordRecoveryPublicRepository.updateCodePasswordRecovery(
        user.id,
        newCode,
      );
    if (!result) throw new Error('Updating password recovery code is failed');

    this.emailManager.sendEmailPasswordRecovery(email, newCode);

    return;
  }
}
