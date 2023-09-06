import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ResponseTypeService } from '../../../../infrastructure/utils/functions/types/create-responses-service.types.service';
import { createResponseService } from '../../../../infrastructure/utils/functions/create-response-service.function';
import { DevicesQueryRepository } from '../../infrastructure/query.repository/devices.query.repository';
import { DevicesRepository } from '../../infrastructure/repository/devices.repository';
import { UnauthorizedException } from '@nestjs/common';
import { JwtAdapter } from '../../../../infrastructure/adapters/jwt.adapter';

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
    protected deviceRepository: DevicesRepository,
  ) {}
  async execute(command: CreateDeviceCommand): Promise<void> {
    const { ip, title, userId, refreshToken } = command;

    const payloadToken = this.jwtAdapter.getPayloadToken(refreshToken);
    if (!payloadToken) {
      throw new UnauthorizedException();
    }
    await this.deviceRepository.createDevice(ip, title, payloadToken, userId);

    return;
  }
}
