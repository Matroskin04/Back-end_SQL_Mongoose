import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { DevicesQueryRepository } from '../infrastructure/SQL/query.repository/devices.query.repository';
import { DeviceOutputModel } from './models/output/device.output.model';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status.enums';
import { JwtRefreshGuard } from '../../../infrastructure/guards/authorization-guards/jwt-refresh.guard';
import { RefreshToken } from '../../../infrastructure/decorators/auth/refresh-token-param.decorator';
import { Response } from 'express';
import { CurrentUserId } from '../../../infrastructure/decorators/current-user-id.param.decorator';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteDevicesExcludeCurrentCommand } from '../application/use-cases/delete-devices-exclude-current.use-case';
import { DeleteDeviceByIdCommand } from '../application/use-cases/delete-device-by-id.use-case';
import { DevicesOrmQueryRepository } from '../infrastructure/typeORM/query.repository/devices-orm.query.repository';

@Controller('/hometask-nest/security/devices')
export class DevicesController {
  constructor(
    protected commandBus: CommandBus,
    protected devicesOrmQueryRepository: DevicesOrmQueryRepository,
  ) {}

  @UseGuards(JwtRefreshGuard)
  @Get()
  async getAllDevices(
    @CurrentUserId() userId: string,
  ): Promise<DeviceOutputModel> {
    const result = await this.devicesOrmQueryRepository.getAllDevicesByUserId(
      userId,
    );
    return result;
  }

  @UseGuards(JwtRefreshGuard)
  @HttpCode(HTTP_STATUS_CODE.NO_CONTENT_204)
  @Delete()
  async deleteDevicesExcludeCurrent(@RefreshToken() refreshToken: string) {
    await this.commandBus.execute(
      new DeleteDevicesExcludeCurrentCommand(refreshToken),
    );
    return;
  }

  @UseGuards(JwtRefreshGuard)
  @Delete(':id')
  async deleteDeviceById(
    @CurrentUserId() userId: string,
    @Param('id') deviceId: string,
    @Res() res: Response<string>,
  ) {
    const result = await this.commandBus.execute(
      new DeleteDeviceByIdCommand(deviceId, userId),
    );
    res.status(result.status).send(result.message);
  }
}
