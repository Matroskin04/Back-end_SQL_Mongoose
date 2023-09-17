import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResponseTypeService } from '../../../../infrastructure/utils/functions/types/create-responses-service.types.service';
import { createResponseByCodeAndMessage } from '../../../../infrastructure/utils/functions/create-response-service.function';
import { DevicesQueryRepository } from '../../infrastructure/SQL/query.repository/devices.query.repository';
import { DevicesRepository } from '../../infrastructure/SQL/repository/devices.repository';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAdapter } from '../../../../infrastructure/adapters/jwt.adapter';
import { DevicesOrmRepository } from '../../infrastructure/typeORM/repository/devices-orm.repository';

export class CreateDeviceCommand {
  constructor(
    public ip: string,
    public title: string,
    public userId: string,
    public refreshToken: string,
  ) {}
}

@CommandHandler(CreateDeviceCommand)
export class CreateDeviceUseCase
  implements ICommandHandler<CreateDeviceCommand>
{
  constructor(
    protected jwtAdapter: JwtAdapter,
    protected devicesOrmRepository: DevicesOrmRepository,
  ) {}
  async execute(command: CreateDeviceCommand): Promise<void> {
    const { ip, title, userId, refreshToken } = command;

    const payloadToken = this.jwtAdapter.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new UnauthorizedException();
    }
    await this.devicesOrmRepository.createDevice(
      ip,
      title,
      payloadToken,
      userId,
    );

    return;
  }
}
