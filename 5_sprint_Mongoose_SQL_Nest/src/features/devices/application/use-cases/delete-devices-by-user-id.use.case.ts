import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../infrastructure/SQL/repository/devices.repository';
import { DevicesOrmRepository } from '../../infrastructure/typeORM/repository/devices-orm.repository';

export class DeleteDevicesByUserIdCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteDevicesByUserIdCommand)
export class DeleteDevicesByUserIdUseCase
  implements ICommandHandler<DeleteDevicesByUserIdCommand>
{
  constructor(protected devicesOrmRepository: DevicesOrmRepository) {}

  async execute(command: DeleteDevicesByUserIdCommand): Promise<boolean> {
    const { userId } = command;
    return this.devicesOrmRepository.deleteAllDevicesByUserId(userId);
  }
}
