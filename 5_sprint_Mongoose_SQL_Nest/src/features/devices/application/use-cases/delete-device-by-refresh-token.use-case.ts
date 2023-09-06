import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResponseTypeService } from '../../../../infrastructure/utils/functions/types/create-responses-service.types.service';
import { createResponseService } from '../../../../infrastructure/utils/functions/create-response-service.function';
import { DevicesQueryRepository } from '../../infrastructure/query.repository/devices.query.repository';
import { DevicesRepository } from '../../infrastructure/repository/devices.repository';
import { JwtAdapter } from '../../../../infrastructure/adapters/jwt.adapter';

export class DeleteDeviceByRefreshTokenCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(DeleteDeviceByRefreshTokenCommand)
export class DeleteDeviceByRefreshTokenUseCase
  implements ICommandHandler<DeleteDeviceByRefreshTokenCommand>
{
  constructor(
    protected jwtAdapter: JwtAdapter,
    protected deviceRepository: DevicesRepository,
  ) {}
  async execute(command: DeleteDeviceByRefreshTokenCommand): Promise<boolean> {
    const { refreshToken } = command;

    const payloadToken = this.jwtAdapter.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new Error('Refresh is invalid');
    }

    return this.deviceRepository.deleteDeviceById(payloadToken.deviceId);
  }
}
