import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BanInfoSAType } from '../dto/ban-info.dto';
import { UsersRepository } from '../../../infrastructure/SQL/repository/users.repository';
import { DeleteDevicesByUserIdCommand } from '../../../../devices/application/use-cases/delete-devices-by-user-id.use.case';

export class UpdateBanInfoOfUserCommand {
  constructor(public userId: string, public banInfo: BanInfoSAType) {}
}

@CommandHandler(UpdateBanInfoOfUserCommand)
export class UpdateBanInfoOfUserUseCase
  implements ICommandHandler<UpdateBanInfoOfUserCommand>
{
  constructor(
    protected commandBus: CommandBus,
    protected usersRepository: UsersRepository,
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
      await this.commandBus.execute(new DeleteDevicesByUserIdCommand(userId));
      return true;
    }

    //Если юзера разбанят...
    return true;
  }
}
