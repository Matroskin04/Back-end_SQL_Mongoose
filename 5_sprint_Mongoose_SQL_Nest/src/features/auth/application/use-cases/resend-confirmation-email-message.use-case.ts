import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { UsersSARepository } from '../../../users/super-admin/infrastructure/repository/users-sa.repository';
import { EmailManager } from '../../../../infrastructure/managers/email-manager';

export class ResendConfirmationEmailMessageCommand {
  constructor(public userId: ObjectId, public email: string) {}
}
@CommandHandler(ResendConfirmationEmailMessageCommand)
export class ResendConfirmationEmailMessageUseCase
  implements ICommandHandler<ResendConfirmationEmailMessageCommand>
{
  constructor(
    protected usersRepository: UsersSARepository,
    protected emailManager: EmailManager,
  ) {}

  async execute(command: ResendConfirmationEmailMessageCommand): Promise<void> {
    const { userId, email } = command;

    const newCode = uuidv4();
    const newDate = add(new Date(), { hours: 5, seconds: 20 });

    const result = await this.usersRepository.updateCodeConfirmation(
      userId,
      newCode,
      newDate,
    );
    if (!result) {
      throw new Error('Resending confirmation email message failed.');
    }

    this.emailManager.sendEmailConfirmationMessage(email, newCode);
    return;
  }
}
