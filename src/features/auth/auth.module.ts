import { Module } from '@nestjs/common';
import { Devices } from '../devices/domain/devices.entity';
import { DevicesQueryRepository } from '../devices/infrastructure/SQL/query.repository/devices.query.repository';
import { DevicesOrmQueryRepository } from '../devices/infrastructure/typeORM/query.repository/devices-orm.query.repository';
import { DevicesRepository } from '../devices/infrastructure/SQL/repository/devices.repository';
import { DevicesOrmRepository } from '../devices/infrastructure/typeORM/repository/devices-orm.repository';
import { CreateDeviceUseCase } from '../devices/application/use-cases/create-device.use-case';
import { DeleteDeviceByRefreshTokenUseCase } from '../devices/application/use-cases/delete-device-by-refresh-token.use-case';
import { DeleteDevicesExcludeCurrentUseCase } from '../devices/application/use-cases/delete-devices-exclude-current.use-case';
import { DeleteDeviceByIdUseCase } from '../devices/application/use-cases/delete-device-by-id.use-case';
import { DeleteDevicesByUserIdUseCase } from '../devices/application/use-cases/delete-devices-by-user-id.use.case';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
import { DevicesController } from '../devices/api/devices.controller';
import { JwtAdapter } from '../../infrastructure/adapters/jwt.adapter';
import { RegisterUserUseCase } from './application/use-cases/register-user.use-case';
import { ConfirmEmailUseCase } from './application/use-cases/confirm-email.use-case';
import { ResendConfirmationEmailMessageUseCase } from './application/use-cases/resend-confirmation-email-message.use-case';
import { UpdatePasswordUseCase } from './application/use-cases/update-password-use.case';
import { LoginUserUseCase } from './application/use-cases/login-user.use-case';
import { ValidateUserUseCase } from './application/use-cases/validate-user.use-case';
import { SendEmailPassRecoveryUseCase } from './application/use-cases/send-email-pass-recovery.use-case';
import { AuthController } from './api/auth.controller';
import { CryptoAdapter } from '../../infrastructure/adapters/crypto.adapter';
import { EmailManager } from '../../infrastructure/managers/email-manager';
import { UsersOrmRepository } from '../users/infrastructure/typeORM/repository/users-orm.repository';
import { EmailConfirmationOrmRepository } from '../users/infrastructure/typeORM/subrepository/email-confirmation-orm.public.repository';
import { PasswordRecoveryOrmRepository } from '../users/infrastructure/typeORM/subrepository/password-recovery-orm.public.repository';
import { BanInfoOrmRepository } from '../users/infrastructure/typeORM/subrepository/ban-info-orm.public.repository';
import { UsersOrmQueryRepository } from '../users/infrastructure/typeORM/query.repository/users-orm.query.repository';
import { Users } from '../users/domain/users.entity';
import { BannedUsersOfBlog } from '../blogs/domain/banned-users-of-blog.entity';
import { UsersBanInfo } from '../users/domain/users-ban-info.entity';
import { UsersEmailConfirmation } from '../users/domain/users-email-confirmation.entity';
import { UsersPasswordRecovery } from '../users/domain/users-password-recovery.entity';
import { EmailAdapter } from '../../infrastructure/adapters/email.adapter';

const entities = [
  Users,
  BannedUsersOfBlog,
  UsersBanInfo,
  UsersEmailConfirmation,
  UsersPasswordRecovery,
  Devices,
];
const queryRepositories = [UsersOrmQueryRepository];
const repositories = [
  DevicesOrmRepository,
  UsersOrmRepository,
  EmailConfirmationOrmRepository,
  PasswordRecoveryOrmRepository,
  BanInfoOrmRepository,
];
const useCases = [
  RegisterUserUseCase,
  ConfirmEmailUseCase,
  ResendConfirmationEmailMessageUseCase,
  UpdatePasswordUseCase,
  LoginUserUseCase,
  ValidateUserUseCase,
  SendEmailPassRecoveryUseCase,
];
@Module({
  imports: [
    TypeOrmModule.forFeature([...entities]),
    CqrsModule,
    JwtModule.register({}),
  ],
  controllers: [AuthController],
  providers: [
    ...queryRepositories,
    ...repositories,
    ...useCases,
    JwtAdapter,
    CryptoAdapter,
    EmailManager,
    EmailAdapter,
  ],
  exports: [TypeOrmModule],
})
export class AuthModule {}
