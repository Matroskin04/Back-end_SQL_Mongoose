import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserDBType } from '../../../users/domain/users.db.types';
import add from 'date-fns/add';
import { UsersSARepository } from '../../../users/super-admin/infrastructure/repository/users-sa.repository';
import { UsersSAQueryRepository } from '../../../users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { v4 as uuidv4 } from 'uuid';
import { EmailManager } from '../../../../infrastructure/managers/email-manager';

export class SendEmailPassRecoveryCommand {
  constructor(public email: string) {}
}

@CommandHandler(SendEmailPassRecoveryCommand)
export class SendEmailPassRecoveryUseCase
  implements ICommandHandler<SendEmailPassRecoveryCommand>
{
  constructor(
    protected usersRepository: UsersSARepository,
    protected usersQueryRepository: UsersSAQueryRepository,
    protected emailManager: EmailManager,
  ) {}

  async execute(command: SendEmailPassRecoveryCommand): Promise<void> {
    const { email } = command;
    const user: UserDBType | null =
      await this.usersQueryRepository.getUserByLoginOrEmail(email);
    if (!user) return;

    const newCode = uuidv4();
    const newDate = add(new Date(), { hours: 1 });

    await this.usersRepository.updateCodePasswordRecovery(
      user._id,
      newCode,
      newDate,
    );
    this.emailManager.sendEmailPasswordRecovery(email, newCode);

    return;
  }
}
