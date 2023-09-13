import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { EmailManager } from '../../../../infrastructure/managers/email-manager';
import { EmailConfirmationPublicRepository } from '../../../users/infrastructure/SQL/subrepository/email-confirmation.public.repository';

export class ResendConfirmationEmailMessageCommand {
  constructor(public userId: string, public email: string) {}
}
@CommandHandler(ResendConfirmationEmailMessageCommand)
export class ResendConfirmationEmailMessageUseCase
  implements ICommandHandler<ResendConfirmationEmailMessageCommand>
{
  constructor(
    protected emailConfirmationPublicRepository: EmailConfirmationPublicRepository,
    protected emailManager: EmailManager,
  ) {}

  async execute(command: ResendConfirmationEmailMessageCommand): Promise<void> {
    const { userId, email } = command;

    const newCode = uuidv4();
    const result =
      await this.emailConfirmationPublicRepository.updateConfirmationCode(
        userId,
        newCode,
        '5 hours',
      );
    if (!result) {
      throw new Error('Resending confirmation email message failed.');
    }

    this.emailManager.sendEmailConfirmationMessage(email, newCode);
    return;
  }
}
