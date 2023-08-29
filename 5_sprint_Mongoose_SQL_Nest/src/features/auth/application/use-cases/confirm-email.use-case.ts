import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { EmailConfirmationPublicRepository } from '../../../users/infrastructure/subrepository/email-confirmation.public.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/query.repository/users.query.repository';

export class ConfirmEmailCommand {
  constructor(public confirmationCode: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(
    protected usersQueryRepository: UsersQueryRepository,
    protected emailConfirmationPublicRepository: EmailConfirmationPublicRepository,
  ) {}

  async execute(command: ConfirmEmailCommand): Promise<void> {
    const { confirmationCode } = command;
    const userId = await this.usersQueryRepository.getUserIdByConfirmationCode(
      confirmationCode,
    );
    if (!userId) {
      throw new BadRequestException([
        { message: 'Code is incorrect', field: 'code' },
      ]);
    }

    const result =
      await this.emailConfirmationPublicRepository.updateEmailConfirmationStatus(
        userId,
      );

    if (!result)
      throw new Error('Updating status of email confirmation failed');

    return;
  }
}
