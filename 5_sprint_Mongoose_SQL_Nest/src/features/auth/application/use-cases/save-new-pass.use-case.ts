import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { CryptoAdapter } from '../../../../infrastructure/adapters/crypto.adapter';
import { UsersPublicQueryRepository } from '../../../users/public/infrastructure/query.repository/users-public.query.repository';
import { createBodyErrorBadRequest } from '../../../../infrastructure/utils/functions/create-error-bad-request.function';
import { UsersPublicRepository } from '../../../users/public/infrastructure/repository/users-public.repository';

export class SaveNewPassCommand {
  constructor(public newPassword: string, public recoveryCode: string) {}
}

@CommandHandler(SaveNewPassCommand)
export class SaveNewPassUseCase implements ICommandHandler<SaveNewPassCommand> {
  constructor(
    protected cryptoAdapter: CryptoAdapter,
    protected usersPublicRepository: UsersPublicRepository,
    protected usersPublicQueryRepository: UsersPublicQueryRepository,
  ) {}

  async execute(command: SaveNewPassCommand): Promise<void> {
    const { newPassword, recoveryCode } = command;
    const user = await this.usersPublicQueryRepository.getUserByRecoveryCode(
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
    const result = await this.usersPublicRepository.updatePassword(
      passwordHash,
      user.id,
    );
    if (!result) throw new Error('Updating password is failed');

    return;
  }
}
