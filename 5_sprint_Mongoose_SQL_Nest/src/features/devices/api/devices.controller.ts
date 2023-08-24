import { Controller, Delete, Get, Param, Res, UseGuards } from '@nestjs/common';
import { DevicesQueryRepository } from '../infrastructure/query.repository/devices.query.repository';
import { DevicesService } from '../application/devices.service';
import { DeviceOutputModel } from './models/output/device.output.model';
import { HTTP_STATUS_CODE } from '../../../infrastructure/utils/enums/http-status';
import { SkipThrottle } from '@nestjs/throttler';
import {
  JwtRefreshGuard,
  JwtRefreshGuardMongo,
} from '../../../infrastructure/guards/authorization-guards/jwt-refresh.guard';
import { RefreshToken } from '../../../infrastructure/decorators/auth/refresh-token-param.decorator';
import { Response } from 'express';
import {
  CurrentUserId,
  CurrentUserIdMongo,
} from '../../../infrastructure/decorators/auth/current-user-id.param.decorator';
import { ObjectId } from 'mongodb';

@SkipThrottle()
@Controller('/hometask-nest/security/devices')
export class DevicesController {
  constructor(
    protected devicesQueryRepository: DevicesQueryRepository,
    protected devicesService: DevicesService,
  ) {}

  @UseGuards(JwtRefreshGuard)
  @Get()
  async getAllDevices(
    @CurrentUserId() userId: string,
  ): Promise<DeviceOutputModel> {
    const result = await this.devicesQueryRepository.getAllDevicesByUserId(
      userId,
    );
    return result;
  }

  @UseGuards(JwtRefreshGuardMongo)
  @Delete()
  async deleteDevicesExcludeCurrent(
    @RefreshToken() refreshToken: string,
    @Res() res: Response<string>,
  ) {
    await this.devicesService.deleteDevicesExcludeCurrent(refreshToken);
    res.sendStatus(HTTP_STATUS_CODE.NO_CONTENT_204);
  }

  @UseGuards(JwtRefreshGuardMongo)
  @Delete(':id')
  async deleteDeviceById(
    @CurrentUserIdMongo() userId: ObjectId,
    @Param('id') deviceId: string,
    @Res() res: Response<string>,
  ) {
    const result = await this.devicesService.deleteDeviceById(
      deviceId,
      userId.toString(),
    );
    res.status(result.status).send(result.message);
  }
}
