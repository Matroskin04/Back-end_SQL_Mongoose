import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DevicesRepository } from '../../infrastructure/repository/devices.repository';

export class DeleteDevicesByUserIdCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteDevicesByUserIdCommand)
export class DeleteDevicesByUserIdUseCase
  implements ICommandHandler<DeleteDevicesByUserIdCommand>
{
  constructor(protected deviceRepository: DevicesRepository) {}

  async execute(command: DeleteDevicesByUserIdCommand): Promise<boolean> {
    const { userId } = command;
    return this.deviceRepository.deleteAllDevicesByUserId(userId);
  }
}
