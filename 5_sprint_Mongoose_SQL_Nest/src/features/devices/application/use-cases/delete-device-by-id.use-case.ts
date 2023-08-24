import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResponseTypeService } from '../../../../infrastructure/utils/functions/types/create-responses-service.types.service';
import { createResponseService } from '../../../../infrastructure/utils/functions/create-response-service.function';
import { DevicesQueryRepository } from '../../infrastructure/query.repository/devices.query.repository';
import { DevicesRepository } from '../../infrastructure/repository/devices.repository';

export class DeleteDeviceByIdCommand {
  constructor(public deviceId: string, public userId: string) {}
}

@CommandHandler(DeleteDeviceByIdCommand)
export class DeleteDeviceByIdUseCase
  implements ICommandHandler<DeleteDeviceByIdCommand>
{
  constructor(
    protected devicesQueryRepository: DevicesQueryRepository,
    protected deviceRepository: DevicesRepository,
  ) {}
  async execute(
    command: DeleteDeviceByIdCommand,
  ): Promise<ResponseTypeService> {
    const { deviceId, userId } = command;
    const device = await this.devicesQueryRepository.getDeviceById(deviceId);

    if (!device) return createResponseService(404, 'The device is not found');
    if (device.userId !== userId)
      return createResponseService(403, "You can't delete not your own device");

    const result = await this.deviceRepository.deleteDeviceById(deviceId);
    if (!result) {
      throw new Error('The device is not found');
    }

    return createResponseService(204, 'Successfully deleted');
  }
}
