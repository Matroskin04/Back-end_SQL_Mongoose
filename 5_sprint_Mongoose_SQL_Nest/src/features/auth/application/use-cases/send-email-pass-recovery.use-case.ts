import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDBType } from '../../../users/domain/users.db.types';
import add from 'date-fns/add';
import { UsersSARepository } from '../../../users/super-admin/infrastructure/repository/users-sa.repository';
import { UsersSAQueryRepository } from '../../../users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { v4 as uuidv4 } from 'uuid';
import { EmailManager } from '../../../../infrastructure/managers/email-manager';
import { UsersPublicQueryRepository } from '../../../users/public/infrastructure/query.repository/users-public.query.repository';
import { PasswordRecoveryPublicRepository } from '../../../users/public/infrastructure/subrepositories/password-recovery.public.repository';

export class SendEmailPassRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendEmailPassRecoveryCommand)
export class SendEmailPassRecoveryUseCase
  implements ICommandHandler<SendEmailPassRecoveryCommand>
{
  constructor(
    protected passwordRecoveryPublicRepository: PasswordRecoveryPublicRepository,
    protected usersPublicQueryRepository: UsersPublicQueryRepository,
    protected emailManager: EmailManager,
  ) {}

  async execute(command: SendEmailPassRecoveryCommand): Promise<void> {
    const { email } = command;
    const user =
      await this.usersPublicQueryRepository.getUserPassEmailInfoByLoginOrEmail(
        email,
      );
    if (!user) return;

    const newCode = uuidv4();
    const result =
      await this.passwordRecoveryPublicRepository.updateCodePasswordRecovery(
        user.id,
        newCode,
        '1 hour',
      );
    if (!result) throw new Error('Updating password recovery code is failed');

    this.emailManager.sendEmailPasswordRecovery(email, newCode);

    return;
  }
}
