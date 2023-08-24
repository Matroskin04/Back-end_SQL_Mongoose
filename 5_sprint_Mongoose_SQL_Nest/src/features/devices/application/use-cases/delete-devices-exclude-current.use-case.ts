import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '../../../jwt/jwt.service';
import { DevicesRepository } from '../../infrastructure/repository/devices.repository';

export class DeleteDevicesExcludeCurrentCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(DeleteDevicesExcludeCurrentCommand)
export class DeleteDevicesExcludeCurrentUseCase
  implements ICommandHandler<DeleteDevicesExcludeCurrentCommand>
{
  constructor(
    protected jwtService: JwtService,
    protected deviceRepository: DevicesRepository,
  ) {}
  async execute(
    command: DeleteDevicesExcludeCurrentCommand,
  ): Promise<void | false> {
    const { refreshToken } = command;

    const payloadToken = this.jwtService.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new Error('Refresh is invalid');
    }

    const result = await this.deviceRepository.deleteDevicesExcludeCurrent(
      payloadToken.deviceId,
    );
    // if (!result) {
    //   throw new Error('Deletion failed');
    // }

    return;
  }
}
