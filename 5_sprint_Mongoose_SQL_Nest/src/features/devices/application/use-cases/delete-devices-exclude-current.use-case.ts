import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtAdapter } from '../../../../infrastructure/adapters/jwt.adapter';
import { DevicesRepository } from '../../infrastructure/SQL/repository/devices.repository';
import { DevicesOrmRepository } from '../../infrastructure/typeORM/repository/devices-orm.repository';

export class DeleteDevicesExcludeCurrentCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(DeleteDevicesExcludeCurrentCommand)
export class DeleteDevicesExcludeCurrentUseCase
  implements ICommandHandler<DeleteDevicesExcludeCurrentCommand>
{
  constructor(
    protected jwtAdapter: JwtAdapter,
    protected deviceOrmRepository: DevicesOrmRepository,
  ) {}
  async execute(
    command: DeleteDevicesExcludeCurrentCommand,
  ): Promise<void | false> {
    const { refreshToken } = command;

    const payloadToken = this.jwtAdapter.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new Error('Refresh is invalid');
    }

    const result = await this.deviceOrmRepository.deleteDevicesExcludeCurrent(
      payloadToken.deviceId,
    );
    // if (!result) {
    //   throw new Error('Deletion failed');
    // }

    return;
  }
}
