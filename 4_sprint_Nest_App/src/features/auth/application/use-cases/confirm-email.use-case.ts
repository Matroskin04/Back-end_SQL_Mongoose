import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { UsersSAQueryRepository } from '../../../users/super-admin/infrastructure/query.repository/users-sa.query.repository';
import { UsersSARepository } from '../../../users/super-admin/infrastructure/repository/users-sa.repository';

export class ConfirmEmailCommand {
  constructor(public confirmationCode: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase
  implements ICommandHandler<ConfirmEmailCommand>
{
  constructor(
    protected usersQueryRepository: UsersSAQueryRepository,
    protected usersRepository: UsersSARepository,
  ) {}

  async execute(command: ConfirmEmailCommand): Promise<void> {
    const { confirmationCode } = command;

    const user = await this.usersQueryRepository.getUserByCodeConfirmation(
      confirmationCode,
    );
    if (!user) {
      throw new BadRequestException([
        { message: 'Code is incorrect', field: 'code' },
      ]);
    }

    const result = await this.usersRepository.updateConfirmation(user._id);
    if (!result) {
      throw new Error('Email confirmation failed.');
    }

    return;
  }
}
