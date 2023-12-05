import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule } from '@nestjs/jwt';
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
import { EmailConfirmationOrmRepository } from '../users/infrastructure/typeORM/subrepository/email-confirmation-orm.public.repository';
import { PasswordRecoveryOrmRepository } from '../users/infrastructure/typeORM/subrepository/password-recovery-orm.public.repository';
import { UserBanInfoOrmRepository } from '../users/infrastructure/typeORM/subrepository/ban-info-orm.public.repository';
import { EmailAdapter } from '../../infrastructure/adapters/email.adapter';
import { UsersModule } from '../users/users.module';
import { DevicesModule } from '../devices/devices.module';

//todo fix adapters
const repositories = [
  EmailConfirmationOrmRepository,
  PasswordRecoveryOrmRepository,
  UserBanInfoOrmRepository,
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
  imports: [CqrsModule, JwtModule.register({}), UsersModule, DevicesModule],
  controllers: [AuthController],
  providers: [
    ...repositories,
    ...useCases,
    JwtAdapter,
    CryptoAdapter,
    EmailManager,
    EmailAdapter,
  ],
  exports: [],
})
export class AuthModule {}
