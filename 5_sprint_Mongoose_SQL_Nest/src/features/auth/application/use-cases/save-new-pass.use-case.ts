import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { CryptoAdapter } from '../../../../infrastructure/adapters/crypto.adapter';
import { createBodyErrorBadRequest } from '../../../../infrastructure/utils/functions/create-error-bad-request.function';
import { UsersRepository } from '../../../users/infrastructure/SQL/repository/users.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/SQL/query.repository/users.query.repository';

export class SaveNewPassCommand {
  constructor(public newPassword: string, public recoveryCode: string) {}
}

@CommandHandler(SaveNewPassCommand)
export class SaveNewPassUseCase implements ICommandHandler<SaveNewPassCommand> {
  constructor(
    protected cryptoAdapter: CryptoAdapter,
    protected usersRepository: UsersRepository,
    protected usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute(command: SaveNewPassCommand): Promise<void> {
    const { newPassword, recoveryCode } = command;
    const user = await this.usersQueryRepository.getUserByRecoveryCode(
      recoveryCode,
    );

    if (!user || +new Date(user.expirationDate) < +new Date())
      throw new BadRequestException(
        createBodyErrorBadRequest(
          'RecoveryCode is incorrect or expired',
          'recoveryCode',
        ),
      );

    const passwordHash = await this.cryptoAdapter._generateHash(newPassword);
    const result = await this.usersRepository.updatePassword(
      passwordHash,
      user.id,
    );
    if (!result) throw new Error('Updating password is failed');

    return;
  }
}
