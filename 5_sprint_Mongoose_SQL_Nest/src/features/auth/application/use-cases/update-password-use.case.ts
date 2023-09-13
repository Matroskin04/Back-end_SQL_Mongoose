import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BadRequestException } from '@nestjs/common';
import { CryptoAdapter } from '../../../../infrastructure/adapters/crypto.adapter';
import { createBodyErrorBadRequest } from '../../../../infrastructure/utils/functions/create-error-bad-request.function';
import { UsersRepository } from '../../../users/infrastructure/SQL/repository/users.repository';
import { UsersQueryRepository } from '../../../users/infrastructure/SQL/query.repository/users.query.repository';
import { UsersOrmRepository } from '../../../users/infrastructure/typeORM/repository/users-orm.repository';
import { UsersOrmQueryRepository } from '../../../users/infrastructure/typeORM/query.repository/users-orm.query.repository';

export class UpdatePasswordCommand {
  constructor(public newPassword: string, public recoveryCode: string) {}
}

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase
  implements ICommandHandler<UpdatePasswordCommand>
{
  constructor(
    protected cryptoAdapter: CryptoAdapter,
    protected usersOrmRepository: UsersOrmRepository,
    protected usersOrmQueryRepository: UsersOrmQueryRepository,
  ) {}

  async execute(command: UpdatePasswordCommand): Promise<void> {
    const { newPassword, recoveryCode } = command;
    const user = await this.usersOrmQueryRepository.getUserByRecoveryCode(
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
    const result = await this.usersOrmRepository.updatePassword(
      passwordHash,
      user.id,
    );
    if (!result) throw new Error('Updating password is failed');

    return;
  }
}
