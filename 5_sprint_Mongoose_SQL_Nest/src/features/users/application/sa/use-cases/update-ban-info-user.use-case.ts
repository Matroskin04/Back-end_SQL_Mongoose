import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanInfoSAType } from '../dto/ban-info.dto';
import { DevicesService } from '../../../../devices/application/devices.service';
import { UsersRepository } from '../../../public/infrastructure/repository/users.repository';

export class UpdateBanInfoOfUserCommand {
  constructor(public userId: string, public banInfo: BanInfoSAType) {}
}

@CommandHandler(UpdateBanInfoOfUserCommand)
export class UpdateBanInfoOfUserUseCase
  implements ICommandHandler<UpdateBanInfoOfUserCommand>
{
  constructor(
    protected usersRepository: UsersRepository,
    protected devicesService: DevicesService,
  ) {}

  async execute(command: UpdateBanInfoOfUserCommand): Promise<boolean> {
    const { userId, banInfo } = command;

    const isUpdated = await this.usersRepository.updateBanInfoOfUser(
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
