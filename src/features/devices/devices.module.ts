import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { CreateDeviceUseCase } from './application/use-cases/create-device.use-case';
import { DeleteDeviceByRefreshTokenUseCase } from './application/use-cases/delete-device-by-refresh-token.use-case';
import { DeleteDevicesExcludeCurrentUseCase } from './application/use-cases/delete-devices-exclude-current.use-case';
import { DeleteDeviceByIdUseCase } from './application/use-cases/delete-device-by-id.use-case';
import { DeleteDevicesByUserIdUseCase } from './application/use-cases/delete-devices-by-user-id.use.case';
import { DevicesController } from './api/devices.controller';
import { DevicesQueryRepository } from './infrastructure/SQL/query.repository/devices.query.repository';
import { DevicesOrmQueryRepository } from './infrastructure/typeORM/query.repository/devices-orm.query.repository';
import { DevicesRepository } from './infrastructure/SQL/repository/devices.repository';
import { DevicesOrmRepository } from './infrastructure/typeORM/repository/devices-orm.repository';
import { JwtAdapter } from '../../infrastructure/adapters/jwt.adapter';
import { Devices } from './domain/devices.entity';
import { JwtModule } from '@nestjs/jwt';

const entities = [Devices];
const queryRepositories = [DevicesQueryRepository, DevicesOrmQueryRepository];
const repositories = [DevicesRepository, DevicesOrmRepository];
const useCases = [
  CreateDeviceUseCase,
  DeleteDeviceByRefreshTokenUseCase,
  DeleteDevicesExcludeCurrentUseCase,
  DeleteDeviceByIdUseCase,
  DeleteDevicesByUserIdUseCase,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([...entities]),
    CqrsModule,
    JwtModule.register({}),
  ],
  controllers: [DevicesController],
  providers: [...queryRepositories, ...repositories, ...useCases, JwtAdapter],
  exports: [TypeOrmModule],
})
export class DevicesModule {}
