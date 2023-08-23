import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanInfoSAType } from '../dto/ban-info.dto';
import { UsersSARepository } from '../../infrastructure/repository/users-sa.repository';
import { DevicesService } from '../../../../devices/application/devices.service';

export class UpdateBanInfoOfUserCommand {
  constructor(public userId: string, public banInfo: BanInfoSAType) {}
}

@CommandHandler(UpdateBanInfoOfUserCommand)
export class UpdateBanInfoOfUserUseCase
  implements ICommandHandler<UpdateBanInfoOfUserCommand>
{
  constructor(
    protected usersSARepository: UsersSARepository,
    protected devicesService: DevicesService,
  ) {}

  async execute(command: UpdateBanInfoOfUserCommand): Promise<boolean> {
    const { userId, banInfo } = command;

    const isUpdated = await this.usersSARepository.updateBanInfoOfUser(
      userId,
      banInfo.isBanned,
      banInfo.banReason,
    );
    if (!isUpdated) return false;

    if (banInfo.isBanned) {
      //Если юзера банят:

      //удаляем все девайсы
      await this.devicesService.deleteAllDevicesByUserId(userId);
      return true;
    }

    //Если юзера разбанят...
    return true;
  }
}
