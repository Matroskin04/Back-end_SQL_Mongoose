import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { EmailConfirmationPublicRepository } from '../../../users/infrastructure/SQL/subrepository/email-confirmation.public.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/SQL/query.repository/users.query.repository';
import { EmailConfirmationOrmRepository } from '../../../users/infrastructure/typeORM/subrepository/email-confirmation-orm.public.repository';
import { UsersOrmQueryRepository } from '../../../users/infrastructure/typeORM/query.repository/users-orm.query.repository';

export class ConfirmEmailCommand {
  constructor(public confirmationCode: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
    protected emailConfirmationOrmRepository: EmailConfirmationOrmRepository,
  ) {}

  async execute(command: ConfirmEmailCommand): Promise<void> {
    const { confirmationCode } = command;
    const userId =
      await this.usersOrmQueryRepository.getUserIdByConfirmationCode(
        confirmationCode,
      );
    if (!userId) {
      throw new BadRequestException([
        { message: 'Code is incorrect', field: 'code' },
      ]);
    }

    const result =
      await this.emailConfirmationOrmRepository.updateEmailConfirmationStatus(
        userId,
      );

    if (!result)
      throw new Error('Updating status of email confirmation failed');

    return;
  }
}
