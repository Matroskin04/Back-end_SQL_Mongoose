import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResponseTypeService } from '../../../../infrastructure/utils/functions/types/create-responses-service.types';
import { createResponseByCodeAndMessage } from '../../../../infrastructure/utils/functions/create-response-service.function';
import { DevicesOrmQueryRepository } from '../../infrastructure/typeORM/query.repository/devices-orm.query.repository';
import { DevicesOrmRepository } from '../../infrastructure/typeORM/repository/devices-orm.repository';

export class DeleteDeviceByIdCommand {
  constructor(public deviceId: string, public userId: string) {}
}

@CommandHandler(DeleteDeviceByIdCommand)
export class DeleteDeviceByIdUseCase
  implements ICommandHandler<DeleteDeviceByIdCommand>
{
  constructor(
    protected devicesOrmQueryRepository: DevicesOrmQueryRepository,
    protected deviceOrmRepository: DevicesOrmRepository,
  ) {}
  async execute(
    command: DeleteDeviceByIdCommand,
  ): Promise<ResponseTypeService> {
    const { deviceId, userId } = command;
    const device = await this.devicesOrmQueryRepository.getDeviceById(deviceId);

    if (!device)
      return createResponseByCodeAndMessage(404, 'The device is not found');
    if (device.userId !== userId)
      return createResponseByCodeAndMessage(
        403,
        "You can't delete not your own device",
      );

    const result = await this.deviceOrmRepository.deleteDeviceById(deviceId);
    if (!result) {
      throw new Error('The device is not found');
    }

    return createResponseByCodeAndMessage(204, 'Successfully deleted');
  }
}
