import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanInfoSAType } from '../dto/ban-info.dto';
import { UsersRepository } from '../../../infrastructure/SQL/repository/users.repository';
import { DeleteDevicesByUserIdCommand } from '../../../../devices/application/use-cases/delete-devices-by-user-id.use.case';
import { startTransaction } from '../../../../../infrastructure/utils/functions/db-helpers/transaction.helpers';
import { Users } from '../../../domain/users.entity';
import { UsersEmailConfirmation } from '../../../domain/users-email-confirmation.entity';
import { UsersPasswordRecovery } from '../../../domain/users-password-recovery.entity';
import { UsersBanInfo } from '../../../domain/users-ban-info.entity';
import { DataSource } from 'typeorm';
import { UsersOrmRepository } from '../../../infrastructure/typeORM/repository/users-orm.repository';
import { DevicesOrmRepository } from '../../../../devices/infrastructure/typeORM/repository/devices-orm.repository';
import { Devices } from '../../../../devices/domain/devices.entity';

export class UpdateBanInfoOfUserCommand {
  constructor(public userId: string, public banInfo: BanInfoSAType) {}
}

@CommandHandler(UpdateBanInfoOfUserCommand)
export class UpdateBanInfoOfUserUseCase
  implements ICommandHandler<UpdateBanInfoOfUserCommand>
{
  constructor(
    protected devicesOrmRepository: DevicesOrmRepository,
    protected usersOrmRepository: UsersOrmRepository,
    private dataSource: DataSource,
  ) {}

  async execute(command: UpdateBanInfoOfUserCommand): Promise<boolean> {
    const { userId, banInfo } = command;

    //start transaction
    const dataForTransaction = await startTransaction(this.dataSource, [
      UsersBanInfo,
      Devices,
    ]);
    try {
      const isUpdated = await this.usersOrmRepository.updateBanInfoOfUser(
        userId,
        banInfo.isBanned,
        banInfo.banReason,
        dataForTransaction.repositories.UsersBanInfo,
      );
      if (!isUpdated) return false;

      if (banInfo.isBanned) {
        //Если юзера банят:

        //удаляем все девайсы
        await this.devicesOrmRepository.deleteAllDevicesByUserId(
          userId,
          dataForTransaction.repositories.Devices,
        );
        await dataForTransaction.queryRunner.commitTransaction();
        return true;
      }

      //Если юзера разбанят...
      await dataForTransaction.queryRunner.commitTransaction();
      return true;
    } catch (err) {
      await dataForTransaction.queryRunner.rollbackTransaction();
      console.error('Updating ban info about user failed:', err);
      return false;
    } finally {
      // you need to release query runner which is manually created:
      await dataForTransaction.queryRunner.release();
    }
  }
}
