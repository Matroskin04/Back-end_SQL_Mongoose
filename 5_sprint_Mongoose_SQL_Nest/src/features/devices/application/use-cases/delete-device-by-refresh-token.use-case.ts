import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResponseTypeService } from '../../../../infrastructure/utils/functions/types/create-responses-service.types.service';
import { createResponseByCodeAndMessage } from '../../../../infrastructure/utils/functions/create-response-service.function';
import { DevicesQueryRepository } from '../../infrastructure/SQL/query.repository/devices.query.repository';
import { DevicesRepository } from '../../infrastructure/SQL/repository/devices.repository';
import { JwtAdapter } from '../../../../infrastructure/adapters/jwt.adapter';
import { DevicesOrmRepository } from '../../infrastructure/typeORM/repository/devices-orm.repository';

export class DeleteDeviceByRefreshTokenCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(DeleteDeviceByRefreshTokenCommand)
export class DeleteDeviceByRefreshTokenUseCase
  implements ICommandHandler<DeleteDeviceByRefreshTokenCommand>
{
  constructor(
    protected jwtAdapter: JwtAdapter,
    protected devicesOrmRepository: DevicesOrmRepository,
  ) {}
  async execute(command: DeleteDeviceByRefreshTokenCommand): Promise<boolean> {
    const { refreshToken } = command;

    const payloadToken = this.jwtAdapter.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new Error('Refresh is invalid');
    }

    return this.devicesOrmRepository.deleteDeviceById(payloadToken.deviceId);
  }
}
